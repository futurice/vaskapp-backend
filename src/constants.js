
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
  FEED_DECAY_INTERVAL: 60 * 60 * 2, // In 's' how often posts get +1 baseline hotness score.
};

export default CONST;
