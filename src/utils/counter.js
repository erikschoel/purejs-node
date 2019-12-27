'use strict';

function make(counter) {
  return function() {
    return counter.prefix + counter.count++;
  }
}

function counter(start, prefix) {
  return make({ count: start, prefix: prefix || '' });
}

module.exports = counter;

module.exports.default = counter;
