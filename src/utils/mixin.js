'use strict';

function mixin(items, target, values) {
  if (!(items instanceof Array && typeof items == 'object'))
    return mixin(Object.keys(items), target, items)

  return items.reduce(function(r, v) {
    if (values && values[v]) {
      r[v] = typeof values[v] == 'object' && values[v].value ? values[v].value : values[v];
    }else {
      r[v.name] = typeof v == 'object' && v.value ? v.value : v;
    }
    return r;
  }, target);
}

module.exports = mixin;

module.exports.default = mixin;
