'use strict';

(function(run) {
  var fn = run();
  self.now = fn.now;
  self.nowInfo = fn;
})(
  (function() {
  var perf = self.performance;
  if (perf && (perf.now || perf.webkitNow)) {
    var perfNow = perf.now ? 'now' : 'webkitNow';
    return { obj: perf, fn: perf[perfNow], now: perf[perfNow].bind(perf) };
  }else { return { obj: Date, fn: Date.now, now: Date.now }; }
}));

/* eslint-disable no-extend-native, no-extra-parens */
Array.prototype.sort = (function(sort, create, compare) {
  return function(x, y) {
    if (x instanceof Function) {
      if (y instanceof Function) {
        return sort.call(this, create(x, y, compare));
      } else {
        return sort.apply(this, [].slice.call(arguments));
      }
    } else if (x === true || !x) {
      return sort.call(this, compare(x));
    } else if (typeof x === 'string') {
      return sort.call(this, create(compare(y), function(a) {
        return a ? a[x] : null;
      }));
    }
  }
})(
  Array.prototype.sort,
  (function(y, f, s) {
    return function(a, b) {
      return y(f(a), f(b), s);
    }
  }),
  (function(x) {
    return function(a, b) {
      return (x ? -1 : 1) * (a > b ? 1 : (a < b ? -1 : 0));
    }
  })
);
String.prototype.toDash = function() {
  return this.length < 2 ? this.toLowerCase() : this.replace(/\s+/g, '').replace(/([A-Z][^A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
};
String.prototype.toTypeCode = function() {
  return [ '$', this.split('$').pop().toDash() ].join('').toLowerCase();
};
String.prototype.toTypeName = function() {
  return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
};

var pure     = require('./pure');
var base     = pure.utils.arrApply(require('./ctor'), pure);
var ctor     = new base(base);
var db       = ctor.parse(require('./db'));
var store    = ctor.parse(require('./store'));
var functor  = ctor.parse(pure.classes.$Functor);
var array    = ctor.parse(pure.classes.$Array);
var ap       = functor.parse(pure.classes.$Ap);
var list     = ap.parse(pure.classes.$List);
var cont     = functor.parse(pure.classes.$Cont);
var coyoneda = functor.parse(pure.classes.$Coyoneda);
var free     = functor.parse(pure.classes.$Free);
var io       = functor.parse(pure.classes.$IO);

db.add();
store.add();

pure.ctor = ctor;
ctor.prop('$pure', pure);
ctor.parse(pure.classes.$Bind);

module.exports = pure;
