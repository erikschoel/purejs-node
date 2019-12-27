'use strict';

var dispatcher = require('./dispatcher');
var utils = require('../utils');

var threads = utils.arrApply((function MakeThreads() {

  return [].slice.call(arguments);
})(
  // === IMPORT / PARSE === //
    (function $$THREADS() {
      var funcs = [].slice.call(arguments);
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
    }),
  // === VALUES === //
    (function lazyValue(v) { return (function() { return v; }); }),
    (function lazyFunction(f) { return (function() { return f(); }); }),
    (function atom(f, t) {
      return function() {
        return f(t);
      };
    }),
    (function ftor(f) {
      return function(x) {
        return f.run(x);
      };
    }),
    (function atomize(f) {
      return function() {
        var args = arguments;
        return atom(function() {
          return f.apply(null, args);
        });
      };
    }),
    (function bindLazy(v, f) {
      return function() {
        return f(v())();
      };
    }),
    (function $_atomLazy($_bindLazy) {
      return function atomLazy(f) {
        return function(v) {
          return $_bindLazy(v, f);
        };
      };
    }),
    (function $_mapLazy($_atom) {
      return function mapLazy(f) {
        return function(v) {
          return $_atom(f, v);
        }
      }
    }),
  // === INSTRUCTIONS === //
    (function pure(value)   { return { pure: true,  value: value }; }),
    (function roll(functor) { return { pure: false, value: functor }; }),
    (function $_makeThread($_pure) {
      return function makeThread(value) {
        return function() { return $_pure(value); };
      };
    }),
    (function $_wrap($_roll) {
      return function wrap(instruction) {
        return function() { return $_roll(instruction); };
      }
    }),
    (function makeInstruction() {
      var modeConfig = {
        yield:  { ps9:  true  },
        cont:   { cont: true  },
        suspend:{ susp: true, ps9: true },
        done:   { done: true  },
        fork:   { us0:  true, ps1: true },
        branch: { us9:  true  }
      };
      return function makeInstruction(mode, next) {
        return { mode: mode, next: next, cf: modeConfig[mode] };
      };
    })(),
    (function $_instructionMap($_makeInstruction) {
      return function instructionMap(instruction, f) {
        return $_makeInstruction(instruction.mode, instruction.next.map(f));
      }
    }),
  // === BIND AND LIFT === //
    (function $_bindThread($_bindLazy, $_instructionMap, $_wrap, $_roll, $_lazyValue) {
      return function bindThread(lazyValue, f) {
        return $_bindLazy(lazyValue, function(free) {
          return free.cont ? (free.kont || (free.kont = $_lazyValue(free)))
          : (free.pure || !free.value
            ? f(free.value || free)
            : (free.kont || (free.kont = $_lazyValue($_roll($_instructionMap(free.value, function(v) {
              return bindThread(v, f);
            }))))));
        });
      }
    }),
    (function $_lift($_bindLazy, $_makeThread) {
      return function lift(lazyValue) {
        return $_bindLazy(lazyValue, $_makeThread);
      }
    }),
    (function $_atomThread($_bindThread) {
      return function atomThread(f) {
        return function(v) {
          return $_bindThread(v, f);
        };
      };
    }),
    (function $_liftFn($_makeThread) {
      return function liftFn(fn) {
        return function(value, free, inst) {
          return makeThread(fn(value, free, inst));
        }
      }
    }),
    (function $_liftF($_instructionMap, $_makeThread, $_wrap) {
      return function liftF(instruction) {
        return $_wrap($_instructionMap(instruction, $_makeThread));
      }
    }),
    (function $_mapThread($_bindThread, $_makeThread) {
      return function mapThread(lazyValue, f) {
        return $_bindThread(lazyValue, function(v) {
          return $_makeThread(f(v));
        });
      }
    }),

  // === RUN, YIELD, DONE
    (function $_yyield($liftF, $_makeInstruction) {
      return function yyield() {
        return $_liftF($_makeInstruction('yield', [null]));
      }
    }),
    (function runThreads(threads, status) {
      var free, inst, next, count = 0, index = 0;
      return function(info) {
        if (++status.count && (status.length = threads.length) > 0) {
          free = threads[0](info);
          if (free && free.pure === false) {
            if (!free.cont) {
              threads.shift();
              inst = free.value;
              next = inst.next;
              if (inst.cf.ps9) {
                threads.push.apply(threads, next);
              }else if (inst.cf.us0) {
                threads.unshift(next[0]);
                threads.push.apply(threads, next.slice(1));
              }
            }
            count++;
          }else {
            threads.shift();
          }
          if (inst && inst.cf.susp && count == threads.length && (info.suspend = true))
            count = 0;

          if (threads.length > status.maxlen) status.maxlen = threads.length;
        }
        return !(status.length = threads.length);
      }
    }),
    (function addThreads(make, wrap) {
      return function $_addThreads($_runThreads, $_lazyValue) {
        return function addThreads(threads, enqueue, name) {
          return make(wrap, $_lazyValue, $_runThreads, threads, enqueue, {
            name: name, count: 0, maxlen: 0
          });
        }
      };
    })(
      (function(wrap, lazy, make, threads, enqueue, status) {
        return {
          enqueue: wrap(make(threads, status), threads, enqueue),
          status: lazy(status)
        };
      }),
      (function(run, threads, enqueue) {
        return function() {
          if (!(threads.length * threads.push.apply(threads, arguments))) {
            enqueue(run);
          }
        }
      })
    ),

    (function makeBind() {
      return utils.arrApply([].slice.call(arguments));
    })(
      (function(make, bind, create, cache, wrap, suspend) {
        return function $_makeBind($_wrap, $_roll, $_atom, $_ftor, $_makeInstruction, $_bindLazy, $_lazyValue, $_pure, $_mapLazy, $_runThreads) {
          return make(bind, create, cache, wrap, {
            wrap: $_wrap, roll: $_roll, atom: $_atom, ftor: $_ftor,
            makeInstruction: $_makeInstruction, suspend: suspend,
            bindLazy: $_bindLazy, lazyValue: $_lazyValue, pure: $_pure, mapLazy: $_mapLazy
          });
        }
      }),
      (function make(bind, create, cache, wrap, func) {
        return bind(cache(create(func)), wrap, func);
      }),
      (function bind(bound, wrap, func) {
        return function makeBind(f, x, t) {
          return wrap.call(func, bound.call(func, f), x || {}, t);
        }
      }),
      (function ftor(ctor, ext) {
        return function(x) {
          return ext.call(ctor, x);
        }
      })(
        (function $ftor(ftor) {
          this.ftor = ftor.bind(this);// ftor.of(ftor.run().bind(this));
        }),
        (function(x) {
          this.prototype = {
            constructor: this,
            cache: function(key, value) {
              return (this[key] = x.lazyValue(value))();
            },
            push: function(v) {
              return (this.values || (this.values = [])).push(v);
            },
            flush: function() {
              return (this.values || (this.values = [])).splice(0);
            },
            cont: function() {
              return this.cache('cont', { pure: false, cont: true });
            },
            next: function(v) {
              return x.roll(x.makeInstruction('yield', [ this.run(v) ]));
            },
            wrap: function(v) {
              return x.wrap(x.makeInstruction('yield', [ this.run(v) ]));
            },
            susp: function(v) {
              return this.cache('susp', x.roll(x.makeInstruction('suspend', [ this.run(v) ])));
            },
            bind: function(v, f) {
              return this.cache('bind', x.roll(x.makeInstruction('yield', [ x.atom(f, v) ])));
            },
            lift: function(v) {
              return new this.constructor(this.ftor.lift(v));
            },
            then: function(v) {
              return this.run(v);
            },
            done: function(v) {
              return x.pure(v);
            },
            run: function() {
              return (this.run = x.mapLazy(this.ftor));
            }
          };
          return this;
        })
      ),
      (function cache(b) {
        return function(ftor) {
          var x = new b(ftor);
          x.run();
          return x;
        }
      }),
      (function wrap(b, x, t) {
        if (t) b.suspend = this.suspend(t);
        return b;
      }),
      (function suspend(t) {
        return function(v) {
          return this.done(t.of(this.run(v)));
        }
      })
    ),
  // === ARR THREAD
    (function makeArr(x, f, k) {
      return function() {
        if (x.i < x.arr.length) {
          x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
          if (k && x.i == x.arr.length) {
            x.res = k(x.res);
          }
        }
        return x.i < x.arr.length ? x.next : x.pure;
      }
    }),
    (function $_arrThread($_makeArr, $_makeInstruction, $_lazyValue) {
      return function arrThread(f, k, m) {
        return function(arr) {
          var x  = { arr: arr, i: 0, res: arr.map($_lazyValue()) };
          x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeArr(x, f, k) ]) };
          x.pure = { pure: true,  value: x.res };
          return $_lazyValue(x.next);
        }
      }
    }),
    (function arrThread(f) {
      return function(x) {
        if (x.i < x.arr.length) {
          x.res[x.i] = f(x.arr[x.i], x.i++, x.arr);
          if (k && x.i == x.arr.length) {
            x.res = k(x.res);
          }
        }
        return x.i < x.arr.length ? x.next : x.pure;
      }
    }),
  // === QUEUE THREAD
    (function makeQueue(x, f, k) {
      return function() {
        if (x.arr.length) {
          if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
            if (x.i) x.arr.splice(x.i, 1);
            else x.arr.shift();
          else
            x.i++;
          if (k && !x.arr.length) k(x);
        }
        return x.arr.length ? x.cont : x.pure;
      }
    }),
    (function $_queueThread($_makeQueue, $_makeInstruction, $_lazyValue) {
      return function queueThread(f, k, m) {
        return function(arr) {
          var x  = { arr: arr, i: 0, item: 0, run: 0 };
          x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_makeQueue(x, f, k) ]) };
          x.cont = { pure: false, cont: true };
          x.pure = { pure: true,  value: [] };
          x.push = x.pure.value.push.bind(x.pure.value);
          return $_lazyValue(x.next);
        }
      }
    }),
    (function queueThread(x) {
      if (x.arr.length) {
        if (f(x.arr[(x.i<x.arr.length?x.i:(x.i=0))], x.item++, x.run++) && !(x.item = 0))
          if (x.i) x.arr.splice(x.i, 1);
          else x.arr.shift();
        else
          x.i++;
        if (k && !x.arr.length) k(x);
      }
      return x.arr.length ? x.cont : x.pure;
    }),
  // === LIST THREAD
    (function makeList(x) {
      if (x.arr.length) {
        x.arr = x.arr.filter(x.fn);
      }
      return x.arr.length ? x.next : x.pure;
    }),
    (function $_listThread($_makeList, $_makeInstruction, $_atom, $_lazyValue) {
      return function listThread(f) {
        return function(arr) {
          var x  = { arr: arr.slice(0), fn: f };
          x.push = x.arr.push.bind(x.arr);
          x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_atom($_makeList, x) ]) };
          x.cont = { pure: false, cont: true };
          x.pure = { pure: true,  value: x.arr.slice(0) };
          return x.next;
        }
      }
    }),
  // === FOLD THREAD
    (function makeFold(x) {
      if (x.arr.length) {
        x.arr = x.arr.filter(x.fn);
      }
      return x.arr.length ? x.next : x.pure;
    }),
    (function $_listThread($_makeList, $_makeInstruction, $_atom, $_lazyValue) {
      return function listThread(f, m) {
        return function(arr) {
          var x  = { arr: arr.slice(0), fn: f };
          x.push = x.arr.push.bind(x.arr);
          x.next = { pure: false, value: $_makeInstruction(m || 'yield', [ $_atom($_makeList, x) ]) };
          x.cont = { pure: false, cont: true };
          x.pure = { pure: true,  value: x.arr.slice(0) };
          return x.next;
        }
      }
    })
));

threads.engine = threads.addThreads([], dispatcher.enqueue, '$enqueue');
threads.run = threads.engine.enqueue;

module.exports = threads;

// Allow use of default import syntax in TypeScript
module.exports.default = threads;


