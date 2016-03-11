import _ from 'lodash';
import changeCase from 'change-case';

function deepChangeKeyCase(obj, newCase) {
  const func = changeCase[newCase];
  if (!func) {
    throw new Error('Case not found: ' + newCase);
  }

  return _.reduce(obj, function(memo, val, key) {
    if (_.isPlainObject(val)) {
      memo[func(key)] = deepChangeKeyCase(val, newCase);
    } else {
      memo[func(key)] = val;
    }

    return memo;
  }, {});
}

export {
  deepChangeKeyCase
};
