import _ from 'lodash';
import {expect} from 'chai';
const request = require('./util/request')();

function testActions() {
  describe('/api/actions', function() {
    it('create sima action', () => {
      return request
        .post('/api/actions')
        .set('x-user-uuid', 'hessu')
        .send({
          user: 'hessu',
          type: 'SIMA',
          location: {
            latitude: 0,
            longitude: 0
          }
        })
        .expect(200);
    });

    it('text action without location should succeed', () => {
      return request
        .post('/api/actions')
        .set('x-user-uuid', 'hessu')
        .send({
          user: 'hessu',
          type: 'TEXT',
          text: 'Text message'
        })
        .expect(200);
    });

    it('delete feed item should succeed and author type should be in feed', () => {
      return request
        .post('/api/actions')
        .set('x-user-uuid', 'hessu')
        .send({
          user: 'hessu',
          type: 'TEXT',
          text: 'Text message'
        })
        .expect(200)
        .then(() => {
          return request.get('/api/feed').set('x-user-uuid', 'hessu');
        })
        .then(res => {
          expect(res.body.length).to.equal(1);
          expect(_.omit(res.body[0], 'createdAt')).to.deep.equal({
            id: '1',
            type: 'TEXT',
            author: {
              name: 'Hessu Kypärä',
              team: 'TiTe',
              type: 'ME'
            },
            text: 'Text message'
          });
        });
    });
  });
}

export default testActions;
