'use strict';

function curry(fn, bound, numArgs, countAllCalls) {
  if (((numArgs = numArgs || fn.length) < 2)) return fn;
  else if (!bound && this != self) bound = this;

  var countAll = countAllCalls !== false;
  return function f(args, ctx) {
    return function $_curry() {
      if (bound && !args.length) ctx = bound === true ? this : bound;
      var argss = [].slice.apply(arguments);
      if (countAll && !argss.length) argss.push(undefined);
      if ((args.length + argss.length) < numArgs) {
        return f(args.concat(argss), ctx);
      }else {
        return fn.apply(ctx, args.concat(argss));
      }
    }
  }([]);
}

module.exports = curry;

module.exports.default = curry;
