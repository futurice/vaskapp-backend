import createApp from '../../src/app';
import request from 'supertest-as-promised';

function createRequest() {
  return request(createApp());
}

module.exports = createRequest;
