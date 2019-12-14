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

var dispatcher = require('./dispatcher');
var async = require('./async');
var classes = require('../classes');
var utils = require('../utils');

var pure = {
  klass(name) {
    return classes[name];
  },
  async: async,
  dispatcher: dispatcher,
  enqueue: dispatcher.nextTick.enqueue,
  raf: dispatcher.animFrame.enqueue,
  unit: utils.unit,
  pure: utils.pure,
  curry: utils.curry,
  utils: utils
};

module.exports = pure;

// Allow use of default import syntax in TypeScript
module.exports.default = pure;
