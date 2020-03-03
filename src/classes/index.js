'use strict';

var $Functor = require('./functor');
var $Compose = require('./compose');
var $Maybe = require('./maybe');
var $Array = require('./array');
var $Bind = require('./bind');
var $Ap = require('./ap');
var $Cont = require('./cont');
var $Coyoneda = require('./coyoneda');
var $Free = require('./free');
var $List = require('./list');
var $IO = require('./io');

var classes = {
  $Functor, $Compose, $Maybe, $Array, $Bind, $Ap, $Cont, $Coyoneda, $Free, $List, $IO
}

module.exports = classes;

module.exports.default = classes;
