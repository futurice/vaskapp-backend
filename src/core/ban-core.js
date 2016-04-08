function throwBannedError() {
  var newErr = new Error('User banned');

  newErr.status = 400
  newErr.message = 'User banned';
  newErr.userHeader = 'Banned';
  newErr.userMessage = `Don't be a dick. You've been temporarily banned.`;

  throw newErr;
}

export {
  throwBannedError
};
