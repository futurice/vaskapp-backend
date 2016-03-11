const request = require('./util/request')();

function testActions() {
  describe('/api/actions', function() {
    it('create beer action', () => {
      return request
        .post('/api/actions')
        .send({
          team: 1,
          user: 'de305d54-75b4-431b-adb2-eb6b9e546014',
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
