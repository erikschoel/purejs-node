'use strict';

var Functor = require('./functor');
var Ap = require('./ap');
var Cont = require('./cont');
var Coyoneda = require('./coyoneda');
var List = require('./list');
var IO = require('./io');

var classes = {
  Functor, Ap, Cont, Coyoneda, List, IO
}

module.exports = classes;

module.exports.default = classes;
