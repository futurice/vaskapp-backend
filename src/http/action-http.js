import * as actionCore from '../core/action-core';
import {createJsonRoute} from '../util/express';

let postAction = createJsonRoute(function(req, res) {
  return actionCore.createAction(req.body).then(rowsInserted => undefined);
});

export {
  postAction
};
