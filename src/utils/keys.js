'use strict';

function keys(x) {
  return x instanceof Array ? x.map((v, i) => i) : (typeof x === 'object' ? (x.$keys instanceof Function ? x.$keys() : Object.keys(x)).filter(k => !x || x[k] !== x) : [ x ]);
}

module.exports = keys;

module.exports.default = keys;
