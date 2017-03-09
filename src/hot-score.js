
// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9#.h70m35q0z
// tl;dr Feed item starts with a baseline hot score determined by the posts
// creation time. User votes  are added on top of this baseline score.
// The scale is logarithmic, and thus votes have diminishing returns.
// Example:
// +10    votes +1 score
// +100   votes +2 score
// +1000  votes +3 score
function hotScore(votes, createdAt) {
  let order = Math.log10(Math.max(Math.abs(votes), 1));
  let sign = Math.sign(votes);
  let age = createdAt - process.env.FEED_ZERO_TIME;
  return order + sign * age / process.env.FEED_INFLATION_INTERVAL;
}

export {
  hotScore,
}
