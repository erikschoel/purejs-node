'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function mixin(items, target, values) {
  if (!(items instanceof Array && (typeof items === 'undefined' ? 'undefined' : _typeof(items)) == 'object')) return mixin(Object.keys(items), target, items);

  return items.reduce(function (r, v) {
    if (values && values[v]) {
      r[v] = _typeof(values[v]) == 'object' && values[v].value ? values[v].value : values[v];
    } else {
      r[v.name] = (typeof v === 'undefined' ? 'undefined' : _typeof(v)) == 'object' && v.value ? v.value : v;
    }
    return r;
  }, target);
}

module.exports = mixin;

module.exports.default = mixin;