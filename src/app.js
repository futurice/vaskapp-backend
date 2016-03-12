import _ from 'lodash';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import createRouter from './routes';
import errorResponder from './middleware/error-responder';
import errorLogger from './middleware/error-logger';
import * as throttleCore from './core/throttle-core';

function createApp() {
  const app = express();

  // Heroku's load balancer can be trusted
  app.enable('trust proxy');
  app.disable('x-powered-by');

  const isVerboseTests =
    process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS === 'true';
  if (process.env.NODE_ENV === 'development' || isVerboseTests) {
    app.use(morgan('dev'));
  }

  // Dev and test
  if (process.env.NODE_ENV !== 'production') {
    // Pretty print JSON responses
    app.set('json spaces', 2);

    // Disable caching for easier testing
    app.use(function noCache(req, res, next) {
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', 0);
      next();
    });
  }

  app.use(function requireContentType(req, res, next) {
    const isWriteReq = _.includes(['POST', 'PUT', 'PATCH'], req.method);
    if (isWriteReq && req.headers['content-type'] !== 'application/json') {
      const err = new Error('Content-type: application/json is required');
      err.status = 400;
      return next(err);
    }

    next();
  });

  app.use(bodyParser.json());
  app.use(cors());
  app.use(compression({
    // Compress everything over 10 bytes
    threshold: 10
  }));

  // Initialize routes
  const router = createRouter();
  app.use('/api', router);

  app.use(errorLogger({  }));
  app.use(errorResponder());

	// Initialize internal stuff
	throttleCore.initialize();

  return app;
}

export default createApp;
