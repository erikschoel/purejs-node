'use strict';

var DB = (function() {
  return {
    klass: function DB() {
      this._base   = this._uid = this.root.base;
      this._id     = this._uid;
      this._ref    = this.root.val;
      this._loc    = [];
      this._cache  = {};
      this._stock  = [];
      this._locked = [];
    },
    ext: [
      (function root() {
        return { name: 'root', base: 1000000, val: [] };
      })(),
      (function $locate(nid, loc) {
        var uid = nid - this._base;
        var idx = 0, lvl = 0, div = 1000, val = this._ref;
        while (val && ++idx < 4) {
          lvl = uid < div ? 0 : ((uid - uid%div) / div);
          uid = uid - (div * lvl); div = div / 10;
          while (val.length <= lvl) { val.push([]); }
          if (loc) loc.push(lvl);
          val = val[lvl];
        }
        return loc || val;
      }),
      (function $load(loc) {
        return this._ref[loc[0]][loc[1]][loc[2]];
      }),
      (function locate(nid, loc) {
        return (this._val = this.$locate(nid, loc));
      }),
      (function check(nid) {
        return (!nid || nid < this._base || nid >= this._uid) ? false : true;
      }),
      (function find(nid, full) {
        if (!this.check(nid)) return;
        var val = this._cache[nid] ? this.$load(this._cache[nid]) : this.$locate(nid);
        return val ? (full ? val[nid%10] : val[nid%10][1]) : null;
      }),
      (function cached(nid, full) {
        if (!this.check(nid)) return;
        var val = this.$load(this._cache[nid] || (this._cache[nid] = this.$locate(nid, [])));
        return val ? (full ? val[nid%10] : val[nid%10][1]) : null; 
      }),
      (function retrieve(nid, cached) {
        return cached ? this.cached(nid) : this.find(nid);
      }),
      (function push(val, item, ref) {
        return val[(val.push((this._loc = [ ref || [ [], [], {} ], item ]))-1)][0];
      }),
      (function uid(loc) {
        var uid = 0, val;
        while (loc.length) {
          uid+=Math.pow(10,loc.length)*loc.shift();
        }
        return this._base+uid;
      }),
      (function add(item, ref) {
        if (ref && (ref = this.$locate(ref).at(ref%10))) {
          if (this._uid%10==0) this._val = null;
          item._uid = this._uid++;
          return this.push(this._val || (this._val = this.locate(this._uid)), item, ref[0]);                
        }else if (this._stock.length) {
          var loc   = this._stock.pop();
          var exist = this.$load(loc).at(loc.pop());
          item._uid = exist.pop().uid();
          return exist[0*exist.push(item)];
        }else {
          if (this._uid%10==0) this._val = null;
          item._uid = this._uid++;
          return this.push(this._val || (this._val = this.locate(this._uid)), item);
        }
      }),
      (function restore(item) {
        var uid = item._uid || item;
        var loc = this._locked.findIndex((a) => {
          return a.reduce((r, x, i) => {
            r += (x * Math.pow(10, 3 - i));
            return r;
          }, 0) === uid;
        });
        if (loc >= 0) {
          this._locked.splice(loc, 1);
        }
        return this.find(uid);
      }),
      (function clear(item) {
        if (item._locked) {
          this._locked[(this._locked.push(this.$locate(item._uid, []))-1)].push(item._uid%10);
        }else {
          this._stock[(this._stock.push(this.$locate(item._uid, []))-1)].push(item._uid%10);
        }
        return this;
      })
    ],
    attrs: [
      (function of() {
        return new this();
      })
    ],
    add: function(root) {
      return function(store, ref) {
        return root.add(store, ref);
      };
    },
    make: function(klass) {
      return function(root, data) {
        return (klass.$ctor.prototype.$data = data(root.sys().unit(klass.$ctor.prototype.db = root)));
      }
    },
    data: function(db, add, make) {
      return (db.constructor.prototype.$data = function(klass) {
        return make(klass)(new db.$ctor(), add);
      });
    },
    init: function(type, klass, sys) {
      this.$data = type.data(klass, type.add, type.make);
    }
  };
});

module.exports = DB;

module.exports.default = DB;
