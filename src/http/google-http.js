import {createJsonRoute} from '../util/express';
import * as googleUtil from '../util/google';

let setGoogleToken = createJsonRoute((req, res) => {
  // TODO Make sure its from trusted source
  googleUtil.setToken(req.query.code);
  return undefined;
});

export {
  setGoogleToken,
};
