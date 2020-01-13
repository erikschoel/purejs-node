'use strict';

module.exports = (function() {
  return {
    klass: Array,
    basetype: true,
    functor: function() {
      return this.ctor.find('functor').of(this);
    },
    base: (function(pure) {
      this.pure = function() {
        return pure(Array.apply(arguments));
      };
      this.of = function() {
        return [].slice.call(arguments);
      };
      return (this.prototype.$pure = pure);
    }).call(Array,
      // ===== wraps the array in pure ==== //
      (function MakePure($pure) {
        this.prototype.pure = function(idx, remove) {
          return typeof idx != 'undefined' &&
            idx < this.length && this[idx] instanceof Function
              ? (remove ? this.remove(idx).at(0)(this) : this[idx](this)) : $pure(this);
        };
        return $pure;
      }).call(Array,
        (function(t) {
          return function $_pure(f) {
            return f(t);
          }
        })
      ),
      // ===== calls fn over array: [ fn.apply(undefined, arg1, arg.., arg...) ] ==== //
      (function MakeApply($apply) {
        this.prototype.apply = function(idx, recur) {
          if (recur || idx === true) {
            return $apply(this);
          }else if (idx instanceof Function) {
            return idx.apply(undefined, this.slice(0));
          }else {
            return this[idx||0].apply(undefined, this.slice((idx||0)+1));
          }
        };
      }).call(Array,
        (function apply(bind) {
          return function $apply(x) {
            if (x instanceof Array) {
              return bind($apply)(x).apply();
            }else {
              return x;
            }
          }
        })(
          (function bind(f) {
            return function(x) {
              return Array.prototype.concat.apply([], x.map(f));
            }
          })
        )
      ),
      // ===== more functional array ====== //
      (function MakeArray() {
        String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
        String.prototype.$_matches = String.prototype.$like = function() {
          var search = this.replace(this.$_like, "\\$1");
          search = search.replace(/%/g, '.*').replace(/_/g, '.');
          return RegExp('^' + search + '$', 'gi');
        };
        String.prototype.part = function(index, delim) {
          return this ? this.split(delim || '.').at(index || 0) : '';
        };
        String.prototype.first = function() {
          return this.part(0);
        };
        String.prototype.parts = function(index, delim) {
          return this.split(delim || '.').slice(index || 0).join(delim || '.');
        };
        String.prototype.matches = String.prototype.like = function(search) {
          if (typeof search !== 'string' || this === null) { return false; }
          return search.$like().test(this);
        };
        String.prototype.isLowerCase = function(from, to) {
          return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isLowerCase() : (this.toLowerCase() == this);
        };
        String.prototype.isUpperCase = function(from, to) {
          return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isUpperCase() : (this.toUpperCase() == this);
        };
        String.prototype.toCamel = function(){
          return this.length < 3 ? this.toLowerCase() : this.replace(/\$/g, '').replace('.', '').replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
        };
        String.prototype.toDash = function() {
          return this.length < 2 ? this.toLowerCase() : this.replace(/\s+/g, '').replace(/([A-Z][^A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
        };
        String.prototype.quote = function() {
          return [ '\'', this || '', '\'' ].join('');
        };
        String.prototype.toTypeCode = function() {
          return [ '$', this.split('$').pop().toDash() ].join('').toLowerCase();
        };
        String.prototype.toTypeName = function() {
          return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
        };
        String.prototype.toRegular = function() {
          return this.length ? this.toTypeCode().replace('$', '') : '';
        };
        String.prototype.toKey = function() {
          return this.length ? this.substr(0, 1).toLowerCase().concat(this.slice(1)) : this;
        };
        String.prototype.path = function(rel, full) {
          return rel ? (full ? [ rel ] : []).concat(this.split('.').slice(rel.split('.').length)).join('.') : this;
        };
        this.prototype.insert = function(position) {
          var pos = position < 0 ? (this.length + position) : position;
          this.push.apply(this, this.splice(0, pos).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
          return this;
        };
        this.prototype.merge = function(arr) {
          var idx = 0, len = this.length;
          while (arr.length && idx < len) {
            this.insert((idx++ * 2) + 1, arr instanceof Array ? arr.shift() : arr);
          }
          return this;
        };
        this.prototype.exclude = function() {
          var arr = Array.prototype.concat.apply([], [].slice.call(arguments).map(function(a) {
            return a instanceof Array ? a : (typeof a === 'object' ? Object.keys(a) : [ a ]);
          }));
          return this.filter(function(v) {
            return arr.indexOf(v) < 0;
          });
        };
        this.prototype.of = function() {
          return this[0](this.slice(1));
        };
        this.prototype.at = function(index) {
          return this.length && index < this.length ? this[index] : null;
        };
        this.prototype.first = function() {
          return this.length ? this.at(0) : [];
        };
        this.prototype.last = function() {
          return this.length ? this.at(this.length - 1) : [];
        };
        this.prototype.bimap = function(f, i) {
          return typeof i == 'undefined' ? this.map(f) : this.slice(0, 1).concat(this.slice(i).map(this.fn.bin(f)(this.first())));
        };
        this.prototype.until = function(index) {
          return this.length ? this.splice(0, index) : [];
        };
        this.prototype.remove = function(index, howmany) {
          return this.length ? this.splice(index, howmany || 1) : [];
        };
        this.prototype.flat = this.prototype.flatten = function() {
          return Array.prototype.concat.apply([], this);
        };
        this.prototype.unique = function() {
          return this.filter(function(value, index, self) { 
            return self.indexOf(value) === index;
          });
        };
        this.prototype.obj = function() {
          var values = [].slice.call(arguments).flat();
          return this.reduce(function(r, v, i) {
            if (!v) return r;
            else if (values.length) r[v] = values[i];
            else if (v.name) r[v.name] = v;
            return r;
          }, {});
        };
        this.prototype.prepend = function() {
          return (0*this.unshift.apply(this, [].slice.call(arguments).flat())) || this;
        };
        this.prototype.append = function() {
          return (0*this.push.apply(this, [].slice.call(arguments).flat())) || this;
        };  
        this.prototype.replace = function(i, v) {
          this.splice(i || 0, 1, v);
          return this;
        };
        this.prototype.arr = function() {
          return this.constructor.arr(this);
        };
        this.arr = function(arr) {
          return function $_arr(f) {
            return f ? f(arr) : arr;
          };
        };
        this.range = function(m, n) {
          return Array.apply(null, Array(n - m + 1))
          .map(function (n, x) {
            return m + x;
          });
        };
      }).call(Array)
    ),
    init: function(type, klass, sys) {
      klass.$ctor.konst = sys.utils.$const;
      klass.$ctor.extract = sys.utils.extract;
      klass.find('Functor').attr('$toArray', type.functor);
    }
  };
});

