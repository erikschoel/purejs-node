'use strict';

var andThen = require('./andThen');
var arrApply = require('./arrApply');
var arrBind = require('./arrBind');
var compose = require('./compose');
var clone = require('./clone');
var clone = require('./clone');
var inherit = require('./inherit');
var keys = require('./keys');
var mixin = require('./mixin');
var unit = require('./unit');
var curry = require('./curry');
var pure = require('./pure');
var fold = require('./fold');
var getArgs = require('./getArgs');
var extract = require('./extract');
var $const = require('./const');
var cont = require('./cont');
var counter = require('./counter');
var ctor = require('./ctor');
var right = require('./right');
var left = require('./left');
var toString = require('./toString');
var values = require('./values');
var tap = require('./tap');
var wrap = require('./wrap');
var walk = require('./walk');
var y = require('./y');

var Obj = inherit(function Obj(values) {
  if (values) this.assign(values);
}, Object, {
  of(values) {
    return values instanceof this.constructor ? values : new this.constructor(values);
  },
  clone(values) {
    return clone(this, values);
  },
  pure() {
    return pure(this);
  },
  normalize(value) {
    return typeof value === 'object' ? this.of(value) : value;
  },
  wrap() {
    return utils.wrap(this);
  },
  assign() {
    var args = [].slice.call(arguments);
    if (typeof args[0] === 'object') {
      var vals = args.shift();
      return keys(vals).reduce((acc, key) => {
        acc[key] = this.normalize(vals[key]);
        return acc;
      }, this);
    } else if (typeof args[0] === 'string' && args.length > 1) {
      return { [args.shift()]: this.normalize(args.pop()) }
    }else {
      return {};
    }
  },
  obtain(f) {
    return f(this);
  },
  map(f) {
    return this.obtain((data) => {
      return Object.keys(data).map((key) => {
        return f(key, data[key], data);
      });
    });
  },
  $get(key) {
    return key ? (key instanceof Array ? key.slice(0) : key.split('.')).reduce((acc, key) => {
      return acc[key];
    }, this) : this;
  },
  $root(key) {
    return key ? this.root.get.apply(this.root, [].slice.call(arguments)) : this.root;
  },
  $set(key, value) {
    return this[key] = value;
  },
  $keys() {
    return Object.keys(this);
  },
  toObservable(f) {
    return observable(this)(f);
  },
  values() {
    return this.$keys().reduce((acc, key) => {
      const item = this.$get(key);
      acc[key] = this.is(item) ? item.values() : item;
      return acc;
    }, {});
  }
}, true);

var Empty = inherit(function Empty(v) {
}, Obj, {
  $get(x) {
    // ES: Return what is provided, can be used as a failsafe
    return x;
  }
}, true);

var utils = Obj.of(Object.assign({
  obj: Obj.of, empty: Empty.of, andThen, arrApply, arrBind, compose, counter, inherit, keys, values, mixin, unit, curry,
  pure, fold, getArgs, extract, $const, cont, ctor, right, left, toString, tap, wrap, walk, y,
  log: tap(console.log.bind(console)),
  parseFuncs(funcs) {
    return funcs.reduce((acc, fn) => {
      if (fn.name.indexOf('$_') === 0) {          
        var args = utils.getArgs(fn);
        var func = fn.apply(null, args.map((arg) => {
          return acc[arg.replace('$_', '')];
        }));
        acc[func.name] = func;
      }else {
        acc[fn.name] = fn;
      }
      return acc;
    }, utils.obj());
  }
},(function() {
    return [].slice.call(arguments).reduce((acc, fn) => {
      acc[fn.name] = fn;
      return acc;
    }, {});
  })(
    (function call(f) {
      return function() {
        return f(this);
      }
    }),
    (function atom(f, g) {
      return function() {
        return f(g(this));
      }
    }),
    (function call1(f) {
      return function(x) {
        return f(this, x);
      }
    }),
    (function call2(f) {
      return function(x, y) {
        return f(this, x, y);
      }
    }),
    (function pass(f) {
      return function() {
        return f(this).apply(undefined, arguments);
      }
    }),
    (function apply(f) {
      return function() {
        return f.apply(this, arguments);
      }
    })
  )
));

module.exports = utils;
module.exports.default = utils;
