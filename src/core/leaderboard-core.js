import BPromise from 'bluebird';

function getLeaderboard() {
  return BPromise.resolve([
    {
      id: 123,
      team: 'TiTe',
      score: 10
    },
    {
      id: 321,
      team: 'Luuppi',
      score: 5
    }
  ]);
}

export {
  getLeaderboard
};
