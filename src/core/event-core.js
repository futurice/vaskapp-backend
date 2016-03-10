import BPromise from 'bluebird';

function getEvents() {
  return BPromise.resolve([
    {
      name: 'Wappuinfo',
      startTime: '2016-03-09T21:24:33Z',
      endTime: '2016-03-10T00:00:00Z',
      description: 'Beer',
      coverImage: 'http://s3/path.jpg'
    }
  ]);
}

export {
  getEvents
};
