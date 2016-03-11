import * as userCore from '../core/user-core';
import {createJsonRoute} from '../util/express';

let postUser = createJsonRoute(function(req, res) {
  return userCore.createUser(req.body).then(rowsInserted => undefined);
});

export {
  postUser
};
