const request = require('./util/request')();

function testActions() {
  describe('/api/actions', function () {
    it('create beer action', () => {
      return request
        .post('/api/actions')
        .send({
          team: 1,
          user: 'hessu',
          type: 'BEER',
          location: {
            latitude: 0,
            longitude: 0
          }
        })
        .expect(200);
    });

    it('create text action', () => {
      return request
        .post('/api/actions')
        .send({
          'type': 'TEXT',
          'user': 'hessu',
          'location': {
            'latitude': '0.123',
            'longitude': '0.123'
          },
          'text': 'LOLOLOLOLO'
        })
        .expect(200);
    });
  });
}

export default testActions;
