const request = require('./util/request')();

function testActions() {
  describe('/api/actions', function() {
    it('create beer action', () => {
      return request
        .post('/api/actions')
        .send({
          user: 'hessu',
          type: 'BEER',
          location: {
            latitude: 0,
            longitude: 0
          }
        })
        .expect(200);
    });
  });
}

export default testActions;
