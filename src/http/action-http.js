import * as actionCore from '../core/action-core';
import {createJsonRoute} from '../util';

let postAction = createJsonRoute(function(req, res) {
  return actionCore.createAction();
});

export {
  postAction
};
