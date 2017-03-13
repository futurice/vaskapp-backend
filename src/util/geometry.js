
// Calculates an approxmiation of the distance between two coordinates.
// Degree of inaccuracy grows as distances grow.
// Result is in 'km'
function equirectangularDistance(pointA, pointB, radius) {
  var x = (toRad(pointB.longitude) - toRad(pointA.longitude)) *
          Math.cos((toRad(pointA.latitude) + toRad(pointB.latitude)) / 2);
  var y = toRad(pointB.latitude) - toRad(pointA.latitude);
  return Math.sqrt(x * x + y * y) * radius;
}

function toRad(value) {
    return value * 0.017453292519943295; // Math.PI / 180;
}
export {
  equirectangularDistance,
};
