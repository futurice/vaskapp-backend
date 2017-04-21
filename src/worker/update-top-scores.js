#!/usr/bin/env node
import * as scoreCore from '../core/score-core';
const logger = require('../util/logger')(__filename);


_updateBiases()
.then(() => {
  logger.info('Finished updating top_scores');
  process.exit();
})
.catch(err => {
  logger.error('Updating top_scores errored', err);
  process.exit(1);
});

function _updateBiases() {
  logger.info('Beginning top_score update');
  return scoreCore.updateTopScores();
}
