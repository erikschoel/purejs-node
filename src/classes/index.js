'use strict';

var Functor = require('./functor');
var Ap = require('./ap');
var Coyoneda = require('./coyoneda');
var List = require('./list');
var IO = require('./io');

var classes = {
  Functor, Ap, Coyoneda, List, IO
}

module.exports = classes;

module.exports.default = classes;
