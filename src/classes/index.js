'use strict';

var $Functor = require('./functor');
var $Array = require('./array');
var $Bind = require('./bind');
var $Ap = require('./ap');
var $Cont = require('./cont');
var $Coyoneda = require('./coyoneda');
var $Free = require('./free');
var $List = require('./list');
var $IO = require('./io');

var classes = {
  $Functor, $Array, $Bind, $Ap, $Cont, $Coyoneda, $Free, $List, $IO
}

module.exports = classes;

module.exports.default = classes;
