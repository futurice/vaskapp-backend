const _ = require('lodash');

const bannedUsers = process.env.BANNED_USERS.split(',');

function isUserBanned(userUuid) {
  return _.includes(bannedUsers, userUuid);
}

function throwBannedError() {
  var newErr = new Error('User banned');

  newErr.status = 400
  newErr.message = 'User banned';
  newErr.userHeader = 'Banned';
  newErr.userMessage = `Don't be a dick. You've been temporarily banned.`;

  throw newErr;
}

export {
  isUserBanned,
  throwBannedError
};
