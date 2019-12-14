'use strict';

var dispatcher = require('./dispatcher');
var utils = require('../utils');

var async = utils.arrApply((function MakeAsync() {

  return [].slice.call(arguments);
})(
  // === IMPORT / PARSE === //
    (function $$ASYNC(lazy, then, frcb) {
      var $proc  = dispatcher;
      var $async = utils.obj();
      // var $cont   = this.klass('Cont');

      $async.$set('lazy', lazy($proc, 'nextTick.enqueue'));
      // $cont.prop('lazy', $async.set('lazy', lazy(process, 'nextTick.enqueue')));
      $async.$set('then', then($async.$get('lazy')));
      // $cont.prop('then', utils.get('andThen')(process.get('lazy')));
      utils.$set('fromCallback', frcb.call($proc));

      return $async;
    }),
    (function scheduledBindWrap() {
      return utils.arrApply([].slice.call(arguments));
    })(
      (function wrapDispatcher(wrap, make, start, cont, done, pure) {
        return function bindDispatch(scheduler, timer) {
          var wrapped = scheduler.$set('wrapped', wrap(scheduler));
          scheduler.$set('lazy', wrapped(make(pure, cont, timer)));
          return wrapped(make(done, start, timer));
        }
      }),
      (function WrapTimers(scheduler) {
        return function $schedulerWrap(fn) {
          return fn(scheduler);
        }
      }),
      (function MakeWrap(wrapper, starter, path) {
        return function(scheduler) {
          return starter(scheduler.$get(path), wrapper);
        }
      }),
      (function StartWrap(schedule, wrapper) {
        return function enqueue(succ) {
          return function $_cont(result) {
            return schedule(wrapper(succ, result));
          }
        }
      }),
      (function ContWrap(schedule, wrapper) {
        return function lazyR(result) {
          return function $_pure(succ) {
            return schedule(wrapper(succ, result));
          }
        }
      }),
      (function $_next(succ, result) {
        return function() {
          return succ(result) || true;
        };
      }),
      (function $_pure(succ, pure) {
        return function() {
          return pure(succ) || true;
        };
      })
    ),
    (function monadicBindWrap() {
      return utils.arrApply([].slice.call(arguments));
    })(
      (function makeBind(make, box) {
        return function then(enqueue) {
          return make(box, enqueue);
        }
      }),
      (function make(box, enqueue) {
        return function then(x, f) {
          return function $_pure(succ, fail) {
            return x(box(f, enqueue(succ), fail), fail);
          }
        };
      }),
      (function box(f, succ, fail) {
        return function(t) {
          return f(t)(succ, fail);
        };
      })
    ),
    (function fromCallback(run, list, make, wrap, tick) {
      return function $_fromCallback() {
        return make(list(run, this.$get('nextTick.enqueue')), wrap(tick));
      }
    })(
      (function $run(tick, enqueue, list) {
        return function run() {
          if (!(list.length * list.push.apply(list, Array.prototype.slice.call(arguments))))
            enqueue(tick);
          if (!arguments.length) return run;
        };
      }),
      (function $list(run, enqueue) {
        return function(tick) {
          return function(list) {
            return run(tick, enqueue, list);
          };
        };
      }),
      (function $make(next, from) {
        return function fromCallback(continuation) {
          var arr = [];
          return next(from(arr)(continuation))(arr);
        };
      }),
      (function $wrap(fn) {
        return function(arg1) {
          return function(arg2) {
            return fn(arg1, arg2);
          };
        };
      }),
      (function $tick(arr, continuation) {
        return function tick() {
          if (arr.length) continuation(arr.shift());
          return !arr.length;
        };
      })
    )
));

module.exports = async;

// Allow use of default import syntax in TypeScript
module.exports.default = async;
