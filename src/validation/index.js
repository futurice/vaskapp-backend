var _ = require('lodash');
var Joi = require('joi');

var common = {
  team: Joi.number().integer().min(0),
  userUuid: Joi.string().regex(/^[A-Za-z0-9_-]+$/).min(1, 'utf8').max(128, 'utf8'),
  primaryKeyId: Joi.number().integer().min(0)
};

const schemas = {
  common: common,

  action: {
    user: common.userUuid.required(),
    type: Joi.string().uppercase().required(),
    imageData: Joi.string().when('type', { is: 'IMAGE', then: Joi.required() }),
    text: Joi.string().when('type', { is: 'TEXT', then: Joi.required() }),
    location: Joi.object({
      latitude: Joi.number(),
      longitude: Joi.number()
    })
  },

  user: {
    uuid: common.userUuid.required(),
    name: Joi.string().min(1, 'utf8').max(50, 'utf8').required(),
    team: common.team.required()
  },

  feedParams: {
    beforeId: Joi.number().integer().min(0).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }
};

const conversions = {};

function assert(obj, schemaName) {
  var joiObj = _getSchema(schemaName);

  // All this hassle to get joi to format nice error messages
  var content = {};
  content[schemaName] = obj;
  var expected = {};
  expected[schemaName] = joiObj;

  try {
    Joi.assert(content, expected);
  } catch (err) {
    if (!err.isJoi) {
      throw err;
    }

    _throwJoiError(err);
  };

  // Return for convenience
  return obj;
}

// Converts string `value` to a correct js object.
// `schemaName` refers to key in `conversion` object. It defines all
// conversion functions.
function convert(obj, schemaName) {
  return _.reduce(obj, (memo, val, key) => {
    var func = _getConversion(schemaName)
    if (_.isFunction(func)) {
      memo[key] = func(val);
    } else {
      memo[key] = val;
    }
    return memo;

  }, {});
}

function _getConversion(name) {
  var conversion = _.get(conversions, name);
  if (!conversion) {
    throw new Error('Conversion with name ' + name + ' was not found');
  }
  return conversion;
}

function _getSchema(name) {
  var joiObj = _.get(schemas, name);
  if (!joiObj) {
    throw new Error('Schema with name ' + name + ' was not found');
  }
  return joiObj;
}

function _throwJoiError(err) {
  // See https://github.com/hapijs/joi/blob/v7.2.3/API.md#errors
  var msg = _.get(err, 'details.0.message') || 'Validation error';
  var newErr = new Error(msg);
  newErr.status = 400;
  throw newErr;
}

export {
  assert,
  convert,
  common,
  schemas
};
