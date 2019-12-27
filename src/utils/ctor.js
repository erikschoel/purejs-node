'use strict';

function ctor(name) {
  return (new Function('return function ' + name + '() {\nthis.$_parent.apply(this, arguments);\n}'))();
}

module.exports = ctor;

module.exports.default = ctor;
