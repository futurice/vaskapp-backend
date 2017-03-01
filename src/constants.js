
const CONST = {
  AUTHOR_TYPES: {
    SYSTEM: 'SYSTEM',
    OTHER_USER: 'OTHER_USER',
    ME: 'ME'
  },
  FEED_SORT_TYPES: {
    NEW: 'new',
    HOT: 'hot',
  },
  FEED_SORT_TYPES_ARRAY: [
    'new',
    'hot',
  ],
  FEED_INFLATION_INTERVAL: 60 * 60 * 2, // In 's' how often posts get +1 baseline hotness score.
  FEED_ZERO_TIME: 1483228800, // January 1st, 2017. Time of 0 baseline hot score.
};

export default CONST;
