import CONST from './constants';


function hotScore(votes, createdAt) {
  let order = Math.log10(Math.max(Math.abs(votes), 1));
  let sign = Math.sign(votes);
  let age = createdAt - CONST.FEED_ZERO_TIME;
  return Math.round(order + sign * age / CONST.FEED_INFLATION_INTERVAL);
}

export {
  hotScore,
}
