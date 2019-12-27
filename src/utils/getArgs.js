'use strict';

function getArgs(func) {
  // Courtesy: https://davidwalsh.name/javascript-arguments
  var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
  return args.split(',').map(function(arg) {
    return arg.replace(/\/\*.*\*\//, '').trim();
  }).filter(function(arg) { return arg; });
}

module.exports = getArgs;

module.exports.default = getArgs;
