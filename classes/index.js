'use strict';

var Functor = require('./functor');
var Ap = require('./ap');
var Coyoneda = require('./coyoneda');
var List = require('./list');
var IO = require('./io');

var classes = {
  Functor: Functor, Ap: Ap, Coyoneda: Coyoneda, List: List, IO: IO
};

module.exports = classes;

module.exports.default = classes;