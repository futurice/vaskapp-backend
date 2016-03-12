import * as userCore from '../core/user-core';
import {createJsonRoute} from '../util/express';
import {assert} from '../validation';

let putUser = createJsonRoute(function(req, res) {
  const user = assert(req.body, 'user');

  return userCore.createOrUpdateUser(user)
    .then(rowsInserted => undefined);
});

let getUser = createJsonRoute(function(req, res) {
  return userCore.findByUuid(req.params.uuid);
});

export {
  putUser,
  getUser
};
