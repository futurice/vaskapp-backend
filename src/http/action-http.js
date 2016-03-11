import * as actionCore from '../core/action-core';
import {createJsonRoute} from '../util/express';

let postAction = createJsonRoute(function(req, res) {
  console.log(req.body)
  return actionCore.createAction(req.body);
});

export {
  postAction
};
