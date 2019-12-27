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
})(Array.prototype.sort, (function(y, f, s) {
  return function(a, b) {
    return y(f(a), f(b), s);
  }
}), (function(x) {
    return function(a, b) {
      return (x ? -1 : 1) * (a > b ? 1 : (a < b ? -1 : 0));
    }
  })
);

var observable = require('../observable');
var dispatcher = require('./dispatcher');
var async = require('./async');
var classes = require('../classes');
var utils = require('../utils');
var threads = require('./threads');

var pure = utils.obj({
  klass(name) {
    return name ? classes[name] : classes;
  },
  inherit(ctor, parent, ext, makeOf) {
    return classes[ctor.name] = utils.inherit(ctor, parent, ext, makeOf);
  },
  classes: classes,
  threads: threads,
  async: async,
  dispatcher: dispatcher,
  enqueue: dispatcher.nextTick.enqueue,
  raf: dispatcher.animFrame.enqueue,
  unit: utils.unit,
  pure: utils.pure,
  curry: utils.curry,
  utils: utils
});

var ns = utils.inherit(function NS(values) {
  if (values) this.assign(values);
}, utils.constructor, {
  $pure: utils.$const(pure),
  $classes: {},
  is(value) {
    return value instanceof this.$root.constructor;
  },
  klass(name) {
    return this.$classes['NS' + name] || this.constructor;
  },
  inherit(name, ext) {
    return this.$classes['NS' + name] || (this.$classes['NS' + name] = utils.inherit(utils.ctor('NS' + name), this.constructor, ext, true));
  },
  add(name, values) {
    return (this.data()[name] = this.klass(name).of(values));
  },
  parseItem(item) {
    if (item) {
      // eslint-disable-next-line
      return (new Function('return ' + item + ';'))();
    }
  },
  parse(item) {
    return item;
  },
  stringify(code) {
    return this.parseItem(this.get(name).replace(/\t/g, '  '));
  },
  children() {
    return Object.keys(this.data());
  },
  data() {
    return this;
  },
  get(key) {
    var data = this.data() || {};
    return key ? data[key] : data;
  },
  compileOne(name) {
    // eslint-disable-next-line
    return this.parse(this.parseItem(this.get(name).replace(/\t/g, '  ')));
  },
  compile() {
    return this.of(Object.keys(this).reduce((acc, key) => {
      var item = this.get(key);
      var func = this.is(item) ? item.compile() : (typeof item === 'string' ? this.compileOne(key) : item);
      if (func instanceof Function) {
        acc[func.name] = func;
      } else {
        acc[key] = func;
      }
      return acc;
    }, {}));
  },
  obtain(f, c) {
    if (c === true) {
      return f(this, this.compile());
    } else {
      return f(this);
    }
  },
  map() {
    var args = [].slice.call(arguments);
    var func = args.shift();
    var comp = args.length && typeof args[args.length - 1] === 'boolean' ? args.pop() : false;
    var isrd = args.length > 0;
    return this.obtain((namespace, compiled) => {
      return Object.keys(namespace).reduce((acc, key) => {
        if (isrd) {
          acc[key] = func(namespace[key], key, compiled);
        } else {
          acc.push(func(namespace[key], key, compiled));
        }
        return acc;
      }, isrd ? args.shift() : []);
    });
  },
  update(name, code) {
    return this.data()[name] = this.parse(code);
  },
  runItem(name) {
    if (this[name] instanceof Function && this[name].length === 0) {
      return this[name]();
    }
  }
}, {
  inherit(name, ext) {
    return this.prototype.$classes['NS' + name] || (this.prototype.$classes['NS' + name] = utils.inherit(utils.ctor('NS' + name), this, ext));
  },
  create(ns) {
    return function(name, values) {
      return !name ? ns : (ns[name] ? ns[name].assign(values) : (values instanceof Array ? values : ns.add(name, values || {})));
    }
  },
  init(namespaces) {
    var create = this.create((this.prototype.$root = (new this())));
    if (namespaces) {
      namespaces.forEach((ns) => {
        create(ns, {});
      });
    }
    return create;
  }
});

ns.inherit('extended', {
  parse(item) {
    return item();
  },
  runItem(name) {
    var item = this.get(name);
    var ctor = this.parseItem(item.ctor);
    // eslint-disable-next-line
    var proto = (new Function([ '\treturn {' ].concat(item.proto.split('\n').map((line, index, all) => line === '}' && index < (all.length - 1) ? '},' : line).map(line => '\t\t' + line).concat([ '\t}' ])).join('\n')))();
    var klass = this.$pure().inherit(ctor, this.$pure().klass(item.base), proto, true);
    console.log(klass);
    return klass;
  }
});

pure['namespace'] = ns.init([ 'classes', 'utils', 'tests', 'custom', 'extended', 'instances' ]);

module.exports = pure;

// Allow use of default import syntax in TypeScript
module.exports.default = pure;
