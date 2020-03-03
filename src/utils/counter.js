'use strict';

function make(counter) {
  return function(id) {
    !id || (id = parseInt(id) || 0);
    if (id >= counter.count) {
      counter.count = id + 1;
      return counter.prefix + id;
    } else if (id) {
      return counter.prefix + id;
    } else {
      return counter.prefix + counter.count++;
    }
  }
}

function counter(start, prefix) {
  return make({ count: start, prefix: prefix || '' });
}

module.exports = counter;

module.exports.default = counter;
