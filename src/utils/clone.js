'use strict';

function clone(o, v) {
  var r;
  if (o && typeof o == 'object' && o instanceof Object) {
    r = Object.keys(o).reduce((acc, key) => {
      if (o.hasOwnProperty(key)) {
        acc[key] = clone(o[key]);
      }
      return acc;
    }, {});
  }else if (o && o instanceof Array) {
    r = o.map && o.map(function(v) { return clone(v); });
  }else {
    r = o;
  }
  return v ? Object.assign(r, v) : r;
}

module.exports = clone;

module.exports.default = clone;
