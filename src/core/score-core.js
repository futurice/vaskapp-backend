const {knex} = require('../util/database').connect();
const requireEnvs = require('../util/require-envs');

requireEnvs(['FEED_ZERO_TIME', 'FEED_INFLATION_INTERVAL', 'FEED_BASE_LOG']);

const BASE_LOG = Math.log(process.env.FEED_BASE_LOG);

// https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9#.h70m35q0z
// tl;dr Feed item starts with a baseline hot score determined by the posts
// creation time. User votes  are added on top of this baseline score.
// The scale is logarithmic, and thus votes have diminishing returns.
// Example:
// BASE_LOG     votes +1 score
// BASE_LOG^2   votes +2 score
// BASE_LOG^3   votes +3 score
function hotScore(votes, createdAt) {
  let order = Math.log(Math.max(Math.abs(votes), 1)) / BASE_LOG;
  let sign = Math.sign(votes);
  let age = createdAt - process.env.FEED_ZERO_TIME;
  return order * sign + age / process.env.FEED_INFLATION_INTERVAL;
}

function updateTopScores() {
  const updateSql = `
  UPDATE feed_items
  SET top_score = top_scores.value
  FROM
    (SELECT
      feed_item_id,
      wilsons(
        COUNT(CASE votes.value WHEN 1 THEN 1 ELSE null END)::int,
        COUNT(CASE votes.value WHEN -1 THEN 1 ELSE null END)::int
      ) AS value
    FROM votes
    GROUP BY votes.feed_item_id
    ) AS top_scores
  WHERE feed_items.id = top_scores.feed_item_id
  `;

  return knex.raw(updateSql);
}

export {
  hotScore,
  updateTopScores,
}
