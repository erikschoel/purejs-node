'use strict';

module.exports = (function Free() {
  return {
    parent: 'Functor',
    klass: function Free(x) {
      this.id = this.ctor.$id = this.id();
      this._x = x;
    },
    ext: {
      of(x) {
        return new this.constructor(x);
      },
      map(f) {
        return this.of(this.$fn.mapThread(this._x, f));
      },
      bind(f) {
        return this.of(this.$fn.bindThread(this._x, this.$fn.makeBind(f).run));
      },
      run() {
        return this.$fn.run(this._x);
      }
    },
    attrs: [
      function of(x) {
        return new this(this.prototype.$fn.makeThread(x));
      },
      function lift(x) {
        return this.of(x);
      }
    ],
    threads: require('../core/threads'),
    kont(free) {
      return function $_pure(k) {
        free.map(k).run();
      }
    },
    cont($cont, kont) {
      return function() {
        return $cont.of(kont(new this.constructor(this._x)));
      }
    },
    init(type, klass, sys) {
      klass.prop('cont', type.cont(klass.find('Cont'), type.kont));
      klass.prop('$fn', {
        mapThread: type.threads.mapThread,
        bindThread: type.threads.bindThread,
        makeBind: type.threads.makeBind,
        makeThread: type.threads.makeThread,
        run: type.threads.run
      });
    }
  };
});
