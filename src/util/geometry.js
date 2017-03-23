
import geolib from 'geolib';

function getDistance(pointA, pointB) {
  const distance = geolib.getDistance(
    { latitude: pointA.latitude, longitude: pointB.longitude },
    { latitude: pointB.latitude, longitude: pointB.longitude },
  );

  return distance;
}

export {
  getDistance,
};
