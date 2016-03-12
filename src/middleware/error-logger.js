import _ from 'lodash';
const logger = require('../util/logger')(__filename);

function createErrorLogger(opts) {
  opts = _.merge({
    logRequest: status => {
      return status >= 400 && status !== 404;
    },
    logStackTrace: status => {
      return status >= 500;
    }
  }, opts);

  return function errorHandler(err, req, res, next) {
    var status = err.status ? err.status : 500;
    var log = getLogFunc(status);

    if (opts.logRequest(status)) {
      logRequestDetails(log, req, status);
    }

    if (opts.logStackTrace(status)) {
      log(err, err.stack);
    }
    else {
      log(err.toString());
    }

    next(err);
  };
}

function getLogFunc(status) {
  return status >= 500 ? logger.error : logger.warn;
}

function logRequestDetails(log, req, status) {
  log('Request headers:', req.headers);
  log('Request parameters:', req.params);
  log('Request body:', req.body);
}

module.exports = createErrorLogger;
