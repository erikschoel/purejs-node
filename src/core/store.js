'use strict';

var Store = (function() {
  return {
    klass: function Store(ref, name, uid) {
      this._all = this.$data(this, uid);
      this._val = this._all[0];
      this._ids = this._all[1];
      this._map = this._all[2];
      this._cid = name || 'root';

      this._cache = {};

      if (ref) this._ref = this.is(ref.parent) ? ref.parent : ref;
    },
    ext: [
      (function cid() {
        return this._ref ? this._ref.cid() : this._cid;
      }),
      (function uid() {
        return this._uid;
      }),
      (function nid() {
        return this.prefix+this._uid;
      }),
      (function of(ref, ctor, name) {
        return ctor ? new ctor(ref, name) : new this.constructor(ref, name);
      }),
      (function is(value) {
        return value && value instanceof this.__;
      }),
      (function identifier(asArray, recalc) {
        return this._ref && this._cid == this._ref._cid ? this._ref.identifier(asArray, recalc) : this._identifier(asArray, recalc);
      }),
      (function level() {
        return (this._ref && this._ref._level) || 0;
      }),
      (function store() {
        return this;
      }),
      (function lock() {
        this._locked = true;
      }),
      (function unlock() {
        this._locked = false;
      }),
      (function index(key) {
        return this._map[key];
      }),
      (function ids() {
        return this._ids;
      }),
      (function keys(index) {
        return typeof index == 'number' ? this._ids[index] : this._ids.slice(0);
      }),
      (function vals() {
        return this._val;
      }),
      (function get(key) {
        if (!key && typeof key == 'undefined') return this._ref;
        else if (key && typeof key == 'string' && this._map[key]>=0) return key.substr(0, 1) === '*' ? this.read(key) : this._val[this._map[key]];
        else if (key && typeof key == 'string' && key.indexOf('.')>=0) return this.path(key);
        else return typeof key == 'string' && (key || this._map[key]>=0) ? this._val[this._map[key]] : this._ref;
      }),
      (function val(key, value) {
        return key && typeof key == 'string' && this.has(key) ? (value ? (this._val[this._map[key]] = value) : this._val[this._map[key]]) : (value ? this.set(key, value) : this.get(key));
      }),
      (function read(key) {
        return this.find(this._val[this._map[key]]);
      }),
      (function initial(key) {
        var ref = this;
        while (ref && ref instanceof this.constructor) {
          ref = ref._ref;
        }
        return key ? ref.get(key) : ref.get();
      }),
      (function current() {
        return this.get(this.get('key')||'vals');
      }),
      (function apply(fn, ctx) { // args
        if (typeof fn == 'string') {
          var target = this.get(fn);
          var args   = Array.prototype.slice.call(arguments, 1);
          if (target instanceof Function) return target.apply(ctx || this, args);
        }else if (fn instanceof Function) {
          var args   = Array.prototype.slice.call(arguments, 1);
          return fn.apply(ctx || this, args);
        }
      }),
      (function parent(key) {
        return this._ref && !(this._ref instanceof this.__) ? this._ref.parent(key) : (key ? this._ref.get(key) : this._ref);
      }),
      (function key(index, raw) {
        var key = this._ids[index];
        return key && typeof key === 'string' && !raw ? key.replace('*', '') : key;
      }),
      (function at(index) {
        return this._val.length && index < this._val.length ? this.get(this.keys(index)) : null;
      }),
      (function first() {
        return this._val.length && this.get(this.keys(0));
      }),
      (function last() {
        return this._val.length && this.at(this._val.length - 1);
      }),
      (function has(key) {
        return this.index(key) >= 0 ? true : false;
      }),
      (function set(key, value) {
        return (this._val[(this._map[key] >= 0 ? this._map[key] : (this._map[key] = (this._ids.push(key)-1)))] = value);
      }),
      (function push(key, value) {
        return arguments.length > 1 ? ((this.get(key) || this.set(key, [])).push(value)) : this.push('vals', key);
      }),
      (function add(name, ref, uid) {
        return this.set(name, this.is(ref) ? ref : this.constructor.of(ref || this, name, uid));
      }),
      (function child(name, ctor, ref) {
        var opts = typeof name == 'object' ? name : {};
        if (typeof name == 'string') opts.name = name;
        else if (name && name.name) opts.name = name.name;

        return this.get(opts.name) || this.set(opts.name, this.of(this, ctor, name));
      }),
      (function node(name, ref) {
        return this.child(name, this.__, ref);
      }),
      (function ensure() {
        var path = [].slice.call(arguments).flat().join('.').split('.');
        var node = this, test = node, key;
        while (node && path.length && (key = path.shift())) {
          if ((test = node.get(key))) node = test;
          else node = node.child(key);
        }
        return node;
      }),
      (function ref(value) {
        return value ? (this._ref = value) : this._ref;
      }),
      (function length() {
        return this._val.length;
      }),
      (function clear(id) {
        var node = this, vals;
        if (!node || !node.length || !node.length()) {
          return {};
        }else if (!id) {
          vals = node.reduce(function(r, v, k, n, i) {
            if (node.is(v)) {
              if (node.key(i) === node.key(i, true)) {
                r[k] = v.clear();
                v.db.clear(v);
              }else {
                r[k] = node.key(i, true);
              }
            }else {
              r[k] = v;
            }
            return r;
          }, {});

          node._map = node._all[2] = {};
          node._ids.splice(0);
          node._val.splice(0);
          return vals;
        }else {
          var idx = node._map[id],
          keys = node._ids.splice(0),
          idxs = keys.map(k => node._map[k]),
          val  = [].concat(node._val.splice(0)),
          pos  = 0,
          del  = [],
          tmp;

          node._map = node._all[2] = {};
          while(pos < val.length) {
            if (id != keys[pos]) {
              tmp = val[idxs[pos]];
              if (tmp.isStore) node.add(keys[pos], tmp);
              else node.set(keys[pos], tmp);
            }else {
              del.push([ keys[pos], val[idxs[pos]] ]);
            }
            pos++;
          }
          return del.reduce(function(r, v, i) {
            r[v[0]] = v[1].isStore ? v[1].values(true) : v[1];

            return r;
          }, {});
        }
      }),
      (function lookup(key, orElse) {
        return this.maybe().map(function(store) {
          return key ? (store.get(key)||(orElse && orElse instanceof Function ? orElse(store) : orElse)) : orElse;
        });
      }),
      (function children() {
        return this._ref && !(this._ref instanceof this.__) ? this._ref._children : '';
      }),
      (function base() {
        return this._ref && !(this._ref instanceof this.__) ? this._ref.base() : {};
      }),
      (function(wrap, run) {
        return wrap(run);
      })(
        (function(run) {
          return function values(recur, children, nodes) {
            return run(children, nodes)([], this, recur);
          }
        }),
        (function(children, nodes) {
          return function $values(stack, node, recur) {
            return node._val.reduce(function $reduce(result, value, index) {
              var key = node._ids[index], uid;
              if (node.is(value) && (uid = value.uid())) {
                if (stack.indexOf(uid) >= 0) {
                  result[key] = `[RECUR:${uid}]`;
                }else if (stack.push(uid) && value.get('$$skip')) {
                  // auxiliary node
                }else if (!children && node.children() == key) {
                  value.reduce(function(r, v, k, i) {
                    if (k === key) {
                      // SKIP!
                    }else if (node.is(v)) {
                      if (nodes && ('' + parseInt(k)) !== k && v.cid().indexOf('*') !== 0) {
                        result[key] || (result[key] = []);
                        result[key].push(k);
                      }
                      r[k] = $values(stack.slice(0), v, recur);
                    }else r[k] = v;
                    return r;
                  }, result);
                }else {
                  result[key] = recur ? $values(stack.slice(0), value, typeof recur == 'number' ? (recur - 1) : recur) : value;
                }
              }else if (key && key.indexOf('*') === 0) {
                result[value] = node.ref().values(recur, children, nodes);
              //   node.ref().values().lift(function(vals, code) {
              //     result[vals[code]] = vals;
              //   }).ap(node.get(key.slice(1)));
              }else {
                result[key] = value;
              }
              return result;
            }, node.base());
          }
        })
      ),
      (function convert() {
        return this.parse.apply(this, [].slice.call(arguments));
      }),
      (function each(f) {
        var store = this;
        this._val.forEach(function(v, i) {
          f(v,store._ids[i],i,store);
        });                            
      }),
      (function map(f) {
        var arr = [], store = this;
        this._val.forEach(function(v, i) {
          arr.push(f(v,store._ids[i],i,store));
        });
        return arr;
      }),
      (function filter(f) {
        var arr = [], store = this;
        this._ids.forEach(function(k, i) {
          let v = store.get(k);
          if (f(v,store.key(i),i,store)) {
            arr.push(v);
          }
        });
        return arr;
      }),
      (function reduce(f, r) {
        return this._ids.reduce(function(r, k, i) {
          r.res = f(r.res, r.node.get(k), typeof k === 'string' ? k.replace('*', '') : k, r.node, i);
          return r;
        }, { res: r || {}, node: this }).res;
      }),
      (function $bind(b) {
        return function bind(f, r, p) {
          return this.map(function(v, k, o) {
            return v instanceof Array ? v.arr() : v;
          }).bind(b(f, r || {}, this), p);
        }
      })(
        (function bind(f, x, s, y) {
          return function $fn(v, i, o) {
            var k = y || (s && s.keys ? s.keys(i) : v.name);
            var r = typeof k === 'string' && k.indexOf('*') === 0 ? sys.find(v.uid || v) : v;
            if (s && s.is && s.is(v) && v._val.length) return v.bind(f, (x[k] = {}));
            else if (v && v.name == '$_arr') return v().bind(bind(f, (x[k] = {}), s, k));
            return (x[k] = f(v, k, i, s && s._ref ? (s._cid == s._ref._cid ? s.ref() : s) : o) || v);
          };
        })
      ),
      (function find(value, cached) {
        var val = ('' + (typeof value == 'object' ? (value._uid || value._id || value.uid) : value)).split('.');
        var uid = val.shift();
        var res = uid ? this.db.retrieve(uid, cached) : null;
        return val.length && res ? res.get(val.join('.')) : res;
      }),
      (function info(/* recur, msg, opts */) {
        var args  = [].slice.call(arguments);
        var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
              (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
        var msg   = (args.length && typeof args[0] == 'string' ? args.shift() : '');
        var opts  = (args.length && typeof args[0] == 'object' ? args.shift() : {});
        var count = 0, bind = this.bind(function(x, k, i, o) {
          var info = msg ? [ msg ] : [];
          if (o && o.is) {
            info.push(o.identifier(), k, x, i, o.uid(), o.store().is(x) ? 'store' : o.is(x) ? 'node' : 'value', count);
          }else {
            info.push(x, o, i, count);
          }
          if (opts.log === true) console.log(info);
          count++;
          return info.arr();
        }, opts);
        return recur ? bind.bind(this.unit, opts) : bind;
      }),
      (function object(k) {
        return { '$$': true, value: this.get(k), key: k, index: this.index(k), ref: this.identifier(), object: this, level: this.level() };
      }),
      (function(test, run, expr) {
        return function search(str, recur) {
          return this.vals().select(test(expr(str)), run(recur));
        }
      })(
        (function(expr) {
          return function(x) {
            if (!x) return false;
            else if ((typeof x == 'string' && expr.test(x))
              || (x.key && typeof x.key == 'string' && expr.test(x.key))
              || (x.ref && typeof x.ref == 'string' && (expr.test(x.ref) || expr.test(x.ref.concat('.', x.key))))) {
              return true;
            }
          }
        }),
        (function(recur) {
          return function(x) {
            var o = x && x['$$'] ? x.value : x;
            return o && o.isStore && o.vals && o.length() ? (recur ? o.map(function(v, k, i, o) {
              return k ? o.object(k) : {};
            }) : o.parent().object(o.cid())) : x;
          }
        }),
        (function(str) {
          return (str.match(/[%$]/) ? str : ('%' + str + '%')).replace(/%{2,}/g, '%').$like();
        })
      ),
      (function walk(run) {
        return function walk(key, callback) {
          return run(typeof key == 'string' ? key.split('.') : key.slice(0), callback)(this);
        }
      })(
        (function walk(parts, callback) {
          return function next(node) {
            var key = parts.first() == 'parent' ? parts.first() : parts.shift();
            var val = key == 'parent' ? node.parent() : node.get(key);
            if (val) {
              if (callback(val, key, node)) {
                return val;
              }else {
                return val && node.is(val) && parts.length ? next(val) : null;
              }
            };
          }
        })
      )
    ],
    attrs: [
      (function of(ref, name, uid) {
        return new this(ref, name, uid instanceof this ? uid._uid : uid);
      })
    ],
    find: function() {
      return this.ctor.find.apply(this.ctor, [].slice.call(arguments));
    },
    identifier(key) {
      function calcOnce(node) {
        var path = [], parent = node;
        while ((parent = parent.parent())) {
          path.unshift(parent._cid);
        };
        path.push(node._cid);
        if (node._cache) return (node._cache.identifier = path.slice(node._offset));
        return path.slice(node._offset);
      };
      return function identifier(asArray, reCalc) {
        var path = this._cache && this._cache.identifier && !reCalc ? this._cache.identifier : calcOnce(this);
        return asArray === true ? path : path.join(typeof asArray == 'string' ? asArray : '.');
      };
    },
    cache: function(cache) {
      function node(code) {
        return cache.get(code) || cache.node(code);
      }
      function get(node, args) {
        return args.length ? node.get.apply(node, args) : node.get();
      }
      return function() {
        return get(node(this.$code || this.ctor.$code), [].slice.call(arguments));
      }
    },
    init: function(type, klass, sys) {
      klass.$ctor.prototype.isStore = true;
      klass.$ctor.prototype.$data = this.$data(klass);//type.make(klass));
      klass.$ctor.prototype.unit = sys.utils.unit;
      klass.$ctor.prototype._identifier = type.identifier('_parent');
      sys.klass = type.find;
      var root  = sys.root  = klass.$ctor.prototype.root = sys.unit(new klass.$ctor());
      var store = this.constructor.prototype.$store = sys.root.child('types');
      var index = this.constructor.prototype.$index = store.child('index');
      klass.base.prototype.cache = type.cache(root.node('cache'));
    }
  };
});

module.exports = Store;

module.exports.default = Store;
