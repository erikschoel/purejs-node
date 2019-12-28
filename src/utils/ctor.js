'use strict';

function ctor(name) {
  return (new Function('return function ' + name + '() {\nthis.$super.apply(this, arguments);\n}'))();
}

module.exports = ctor;

module.exports.default = ctor;
