const {knex} = require('../util/database').connect();


const newComment = (action) =>  knex('comments').insert({
  user_id: action.client.id,
  feed_item_id: action.feedItemId,
  text: action.text,
})
.catch((err) => {
  if (err.constraint === 'comments_feed_item_id_foreign') {
    const error = new Error('No such feed item id');
    error.status = 404;
    throw error;
  }

  throw err;
});

export {
  newComment,
};
