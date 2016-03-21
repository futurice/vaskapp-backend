/**
 * Pads given value into given length with zeros
 */
function padLeft(toPad, size) {
    let s = toPad + "";

    while (s.length < size) {
      s = "0" + s;
    }

    return s;
}

export {
  padLeft
};
