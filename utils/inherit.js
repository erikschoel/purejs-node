'use strict';

var mixin = require('./mixin');

function inherit(ctor, parent, props) {
  var F = function F() {};
  F.prototype = parent.prototype;
  var proto = new F(),
      keys = Object.keys(ctor.prototype);
  if (props) mixin(props, proto);
  if (keys.length && ctor.prototype.constructor == ctor) {
    ctor.prototype = keys.reduce(function (r, k, i, o) {
      r[k] = ctor.prototype[k];
      return r;
    }, proto);
  } else {
    proto.constructor = ctor;
    ctor.prototype = proto;
  }
  return ctor;
}

module.exports = inherit;

module.exports.default = inherit;