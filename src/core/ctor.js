'use strict';

var CTOR = (function() {
  return [].slice.call(arguments);
})(
  (function(ctor, proto, make, extend, named, base) {
    base.prototype.sys = this.utils.$const(this);
    extend.constructor.prototype.base = base;
    return this.utils.arrApply(named).call(
      make.call(
        extend.inherit(ctor, base,
          proto.call({ ctor: ctor, base: base, extend: extend }))));
  }),
  (function $CTOR(ctor, attrs, parent) {
    this.ctor(ctor, attrs, parent);
  }),
  (function() {
    return {
      constructor: this.ctor,
      of: function(ctor, attrs, parent) {
        return new this(ctor, attrs, parent);
      },
      is: function(value) {
        if (this.__) return value && value instanceof this.__;
        else if (this.$ctor && this.$ctor.__) return value && value instanceof this.$ctor.__;
        else if (this.$ctor) return value && value instanceof this.$ctor;
      },
      base: this.base,
      sys: this.base.prototype.sys,
      inherit: this.extend.inherit,
      mixin: this.extend.mixin,
      ctor: function(ctor, attrs, parent) {
        this.$ctor = ctor;
        this.$code = '$'+this.constructor.name.replace('$', '').toDash().toLowerCase();
        this.prop('id', this.makeID(this.prop('prefix', ctor.name.replace('$', '').substr(0, 2).toUpperCase())));
        this.init(ctor, attrs, parent);
      },
      type: function(type) {
        return function(x) {
          if (x instanceof type) {
            return this.of(x);
          } else {
            throw new Error('Type cast failure: x is not of type ' + (type.prototype && type.prototype.constructor === type ? type.name : (type.constructor ? type.constructor.name : type)));
          }
        }
      },
      init: function(ctor, attrs, parent) {
        if (this instanceof ctor) {
          ctor.prototype._level = 0;
          ctor.prototype.root = this.sys().utils.$const(this);
          ctor.prototype.tid = this.makeID(100000);
        }else {
          if (parent) this._parent = parent.$code;
          this.constructor.prototype._level = parent ? (parent._level + 1) : 0;
          ctor.ctor = ctor.prototype.ctor = this.add();
        }
        if (!ctor.prototype.$super) ctor.prototype.$super = this.$super;
        if (!ctor.prototype.$parent) ctor.prototype.$parent = this.$parent;
        if (attrs && attrs instanceof Function) {
          ctor.prototype.ctor = attrs;
        }else if (typeof attrs == 'object') {
          this.mixin(attrs, ctor);
        }
        if (!ctor.of) ctor.of = parent ? parent.$ctor.of : this.of;
        this.of = this.$ctor.$of = ctor.of.bind(ctor);
        if (ctor.pure) this.pure = ctor.$pure = ctor.pure.bind(ctor);
        else this.pure = ctor.$pure = parent && parent.$ctor.pure ? parent.$ctor.pure.bind(ctor) : this.of;
        if (ctor.lift) this.lift = ctor.$lift = ctor.lift.bind(ctor);
        if (!ctor.prototype.to) ctor.prototype.to = this.to;
        if (!ctor.prototype.is) ctor.prototype.is = this.is;

        if (parent && parent.$ctor) {
          this.mixin(Object.keys(parent.$ctor).filter(k => k.substr(0, 1) !== '$' && !ctor[k]).reduce((acc, key) => {
            acc[key] = parent.$ctor[key];
            return acc;
          }, {}), ctor);
        }
      },
      parent: function(name) {
        var type = name ? this.find(name) : this;
        var prnt = type._parent == '$ctor' ? this.root() : (this.$store && this.$store._ref ? this.$store.parent('type') : this.find(type._parent));
        var args = [].slice.call(arguments, 1);
        return prnt ? (args.length ? prnt.get(args.join('.')) : prnt) : null;
      },
      level: function() {
        return this._level;
      },
      name: function() {
        return this.$ctor.name.toDash();
      },
      add: function() {
        var uid;
        if (this.$store && this.$store.child) {
          this.constructor.prototype.$store = this.$store.child(this.$code);
          if ((uid = this.$store.set('type', this).$store.uid()) && !this.$index.get(this.$code)) this.$index.set(this.$code, uid);
        }
        return this;
      },
      update: function(base, ext, keys) {
        var xtnd = this.xtnd || (this.root().prop('xtnd', this.sys().get('utils.extend')));
        if (!base) {
          return ext ? xtnd({}, ext) : {};
        }else if (!ext) {
          return xtnd({}, base);
        }else if (keys) {
          var result = xtnd({}, base);
          return Object.keys(ext).reduce(function(r, k, i) {
            if (r[k] && typeof r[k] === 'object') r[k] = xtnd(xtnd({}, r[k]), ext[k]);
            else r[k] = ext[k];
            return r;
          }, result);
        }else {
          return xtnd(xtnd({}, base), ext || {});
        }
      },
      create: function(/* name, ctor */) {
        var args = [].slice.call(arguments);
        var ctor = args[0] instanceof Function ? args.shift() : (args.length > 1 ? args.pop() : null);
        var name = typeof args[0] == 'string' ? args.shift() : (ctor ? ctor.name : this.$ctor.name);
        var child = this.named(name);
        child.prototype = { constructor: child, ctor: ctor };
        return this.extend(child);
      },
      make: function(ctor, proto) {
        if (proto && proto instanceof Function) {
          return proto.call(ctor, this.sys);
        }else if (proto && typeof proto == 'object') {
          this.mixin(proto, ctor.prototype);
        }
        return ctor;
      },
      child: function(ctor, proto, attrs) {
        var klass = this.inherit(this.named(('$'+ctor.name).replace('$$', '$'), true, true), this.constructor);
        var $ctor = ctor instanceof Function ? ctor : this.named(ctor.name.toTypeName(), false, false, true);
        klass.$ctor = attrs && attrs.basetype ? ctor : (this.$code != '$ctor' ? this.inherit($ctor, this.$ctor, proto) : this.inherit($ctor, this.base, proto));
        return klass;
      },
      extend: function(ctor, proto, attrs) {
        var child, exists, klass;
        if (attrs && attrs.basetype) {
          child = ctor;
        }else {
          child = ctor instanceof Function ? ctor : (typeof ctor == 'string' ? { name: ctor } : 'Child');
        }
        exists = this.$store ? this.$store.get(child.name.toTypeCode()) : null;
        if (exists) return exists.get('type');
        klass  = this.child(child, proto, attrs);
        if (!klass.$ctor.prototype.__) klass.$ctor.prototype.__ = klass.$ctor;
        if (!klass.$ctor.prototype.kid) klass.$ctor.prototype.kid = this.kid;
        if (!klass.$ctor.prototype.bin) klass.$ctor.prototype.bin = this.bin;
        return new klass(klass.$ctor, attrs, this);
      },
      parse: function(def) {
        var type  = def instanceof Function ? def.call(this) : def;
        var ctor  = type.klass || type.ctor;
        var proto = type.ext instanceof Function ? type.ext.call(this.sys()) : type.ext;
        var attrs = type.attrs;
        var klass = this.extend(ctor, proto, type.basetype ? { basetype: true } : attrs);
        var extnd = type.extend ? this.find(type.extend).proto() : false;
        if (extnd) {
          Object.keys(extnd).reduce(function(r, k) {
            if (!r[k]) r[k] = extnd[k];
            return r;
          }, klass.proto());
        }
        if (type.init) type.init.call(this, type, klass, this.sys());
        return klass;
      },
      $parent: function() {
        var args = [].slice.call(arguments);
        return this.ctor.parent().prop(args.shift()).apply(this, args);
      },
      $super: function() {
        var level = this.__level__ || 0, parent = this.ctor;
        if (level++ < this.ctor._level) {
          while (level--) {
            parent = parent.parent();
          }
          this.__level__ = this.ctor._level - parent._level;
          if (this.__level__) {
            parent.$ctor.apply(this, arguments);
          }
        }
      },
      $prop: function() {
        var cache = {}, base = this.find('Obj').of([].slice.call(arguments).shift());
        return this.prop('prop', function prop(name) {
          return (cache[name] || (cache[name] = base[name](this.$ctor)));
        });
      },
      $overload: function(klass) {
        var ctor = this.$ctor = this.prop('constructor', Object.keys(this.$ctor).reduce(function(r, k) {
          r.$ctor[k] = r.$old[k];
          return r;
        }, { $ctor: this.inherit(klass, this.$ctor), $old: this.$ctor }).$ctor);

        return this;
      },
      $ready: function(comp) {
        if (typeof this._ready === 'number') {
          this.enqueue(function() {
            comp.state('ready', sys.now());
            return true;
          });
        }else {
          this._ready || (this._ready = []);
          this._ready.push(comp);
        }
        return comp;
      },
      $flush: function() {
        var now = sys.now();
        if (this._ready) {
          while (this._ready.length) {
            this._ready.shift().state('ready', now);
          }
          this._ready = now;
        }else {
          this._ready = now;
        }
        return this;
      },
      find: function() {
        var args = [].slice.call(arguments).join('.').split('.');
        var name = args.shift().toTypeCode();
        var path = args.length ? args.join('.') : '';
        if (name == '$ctor') {
          var res = this.root();
          if (path) res = res.$store.get(path);
        }else {
          var uid = this.$index.get(name);
          var res = uid ? this.$index.find(uid, true) : null;
          if (res && path) res = path === path.toLowerCase() ? res.get(path) : res.get(path.toTypeCode());
          else if (res) res = res.get('type');
        }
        return res;
      },
      get: function(prop) {
        return !prop ? this.$store : (prop.substr(0, 4) == 'root' ? this.$store.root.get(prop.substr(5)) : this.$store.get(prop));
      },
      set: function(prop, value) {
        return this.$store.set(prop, value);
      },
      lookup: function() {
        var args = [].slice.call(arguments).flat();
        return args.length ? this.$store.lookup(args.join('.')) : this.$store.maybe();
      },
      proto: function(name) {
        var $ctor = name ? this.find(name, 'type.$ctor') : this.$ctor;//this.get('type.$ctor');
        if ($ctor) return $ctor.prototype;
      },
      ext: function(ext) {
        return this.mixin(ext, this.$ctor.prototype);
      },
      attr: function(name, value) {
        return value || value === '' ? (this.constructor.prototype[name] = value) : this.constructor.prototype[name];
      },
      prop: function(name, value) {
        return value || value === '' ? (this.$ctor.prototype[name] = value) : this.$ctor.prototype[name];
      },
      fromConstructor: function() {
        var args = [].slice.call(arguments);
        return args.length > 1 ? this.$ctor[args.shift()].apply(this.$ctor, args) : this.$ctor[args.shift()].bind(this.$ctor);
      },
      item: function(name) {
        var args = [].slice.call(arguments).join('.').split('.');
        if (args.length < 2 && args[0]) return this.get('items', args.first()) || this.find(args.first(), 'items.' + args.first().toRegular());
        else if (args.length < 3 && args.insert(1, 'items')) return this.find(args.join('.'));
        else if (args.length) return this.find(args.shift()).item(args.join('.'));
      },
      type: function(name, fn) {
        debugger;
        var type = this.get(name);
        return type ? (fn ? type[fn] : type) : unit;
      },
      test: function(ctor) {
        if (!ctor) return false;
        else if (!ctor.prototype) return this.test(ctor.constructor);
        return ctor.prototype && ctor.prototype.__ === this.$ctor.prototype.__ ? true : false;
      },
      ap: function(x) {
        return x.map ? x.map(this.bind(function(comp, fn) {
          return fn(comp);
        })) : (x instanceof Function ? this.maybe().lift(x) : this.maybe().lift(this.bind(function(c, x, f) {
          return f(x, c);
        })));
      },
      to: function(type) {
        return this.map(this.ctor.find(type).of);
      },
      walk: function(f) {
        var ctor = this;
        while (ctor) {
          if (f(ctor) === true) break;
          else ctor = ctor.parent();
        }
        return ctor;
      }
    };
  }),
  (function(set, makeWithPrefix, makeWithoutPrefix) {
    return set(function(prefix, start) {
      return prefix === false ? makeWithoutPrefix({ start: start || 1000000, id: start || 1000000 })
        : makeWithPrefix({ prefix: prefix, start: start || 1000000, id: start || 1000000 });
    });
  })(
    (function set(makeID) {
      return function() {
        this.prototype.makeID = makeID;
        this.prototype.id = makeID('CT');
        this.prototype.base.prototype.kid = makeID('', 100000);
        return this;
      }
    }),
    (function MakeID(counter) {
      return function() {
        return (counter.prefix + counter.id++);
      }
    }),
    (function MakeID(counter) {
      return function() {
        return counter.id++;
      }
    })
  ),
  (function(ctor, mixin, inherit) {
    ctor.prototype = { constructor: ctor, mixin: mixin, inherit: inherit };
    return new ctor;
  })(
    (function Extend() {}),
    (function(items, target, values) {
      if (!(items instanceof Array && typeof items == 'object'))
        return this.mixin(Object.keys(items), target, items)

      return items.reduce(function(r, v) {
        if (values && values[v]) {
          r[v] = typeof values[v] == 'object' && values[v].value ? values[v].value : values[v];
        }else {
          r[v.name] = typeof v == 'object' && v.value ? v.value : v;
        }
        return r;
      }, target);
    }),
    (function(ctor, parent, props) {
      var F = function() {};
      F.prototype = parent.prototype;
      var proto = new F(), keys = Object.keys(ctor.prototype);
      if (props) this.mixin(props, proto);
      if (keys.length && ctor.prototype.constructor == ctor) {
        ctor.prototype = keys.reduce(function(r, k, i, o) {
          r[k] = ctor.prototype[k];
          return r;
        }, proto);
      }else {
        proto.constructor = ctor;
        ctor.prototype = proto;
      }
      return ctor;
    })
  ),
  (function() {

    return [].slice.call(arguments);
  })(
    (function(build, make, result, wrap) {
      return function() {
        this.prototype.named = wrap(build(make), result);
        return this;
      }
    }),
    (function(pure) {
      var args = [];
      var next = (function(f) { return f(args.shift()); });

      var tmpl = [ 
        pure('(function Make'), next, pure('() {'),
          pure('return function '), next, pure('() {'),
            pure(' this._id = this.id();'),
            pure(' this.ctor.apply(this, arguments);'),
            pure(' this.$super.apply(this, arguments);'),// this.__level__ && !(this.__level__ = 0);'),
            pure(''),//this.__super__.apply(this, arguments);'),
            pure(''),//return this;'),
          pure('}})();') ];

      return function(k) {
        return k(args, next, tmpl);
      }
    })(function(t) { return function(f) { return f(t); }}),
    (function(args, next, tmpl) {
      return function named(name, id, ctor, level, superr) {
        args.push(name, name);
        return tmpl.filter(function(v, i) {
          return i < 6 || (i == 6 && id) || (i == 7 && ctor) || (i == 8 && level) || (i == 9 && superr) || i > 9;
        }).map(this.utils.extract(this.unit)).join('');
      }
    }),
    (function(text) {
      try {
        return eval(text);
      }catch(e) {

      }
    }),
    (function(make, result) {
      return function named() {
        return result(make.apply(this.sys(), [].slice.call(arguments)));
      }
    })
  ),
  (function() {
    this.prototype = {
      klass: function(name) {
        return this.ctor.find(name);
      },
      baseProp: function(name, value) {
        return this.constructor.prototype[name] = value;
      }
    };
    return this;
  }).call((function Base() {}))
);

module.exports = CTOR;
// module.exports.default = $CTOR;
