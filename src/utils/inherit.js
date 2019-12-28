'use strict';

var mixin = require('./mixin');
var unit = require('./unit');

function makeOf(ctor) {
  return function of(v) {
    return new ctor(v);
  }
};

var makeChainableOf = (function($of, $wrap) {
  return function makeChainableOf(of) {
    return function(ctor) {
      return $wrap($of, (ctor.$of = of) && ctor);
    }
  }
})(
  function $of(v) {
    return new this(v);
  },
  function $wrap($of, ctor) {
    return function of(v) {
      return $of.call(ctor, ctor.$of(v));
    }
  }
);

function makeParentOf(parent, ctor) {
  return function of(v) {
    return parent.of.call(ctor, v);
  };
};

function inherit(ctor, parent, props, inst) {
  var F = function() {};
  F.prototype = parent.prototype;
  var proto = new F(), keys = Object.keys(ctor.prototype);
  if (props) mixin(props, proto);
  proto.$super = parent;
  if (keys.length && ctor.prototype.constructor == ctor) {
    ctor.prototype = keys.reduce(function(r, k, i, o) {
      r[k] = ctor.prototype[k];
      return r;
    }, proto);
  }else {
    proto.constructor = ctor;
    ctor.prototype = proto;
  }
  if (inst === true && parent.$of) {
    ctor.of = makeChainableOf(parent.$of)(ctor);
  } else if (inst === true) {
    ctor.of = makeChainableOf(unit)(ctor);
  } else if (typeof inst === 'object') {
    Object.keys(inst).forEach(prop => ctor[prop] = inst[prop]);
  }
  if (!ctor.of) {
    ctor.of = makeOf(ctor);
  }
  return ctor;
}

module.exports = inherit;

module.exports.default = inherit;
