import * as userCore from '../core/user-core';
import {createJsonRoute} from '../util/express';

let putUser = createJsonRoute(function(req, res) {
  return userCore.createOrUpdateUser(req.body).then(rowsInserted => undefined);
});

let getUser = createJsonRoute(function(req, res) {
  return userCore.findByUuid(req.params.uuid);
});

export {
  putUser,
  getUser
};
