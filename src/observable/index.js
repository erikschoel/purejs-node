'use strict';

function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}class Dep {

  constructor() {
    this.subscribers = new Set();
  }
  depend() {
    if (Dep.job) {
      this.subscribers.add(Dep.job);
    }
  }
  notify() {
    this.subscribers.forEach(sub => {
      sub();
    });
  }}_defineProperty(Dep, "job", void 0);

Dep.job = null;

// ---
const depsStorage = new WeakMap();
const handlers = {
  get(target, key, receiver) {
    let deps = depsStorage.get(target);
    if (!deps) {
      deps = {};
      depsStorage.set(target, deps);
    }
    let dep = deps[key];
    if (!dep) {
      dep = deps[key] = new Dep();
    }
    dep.depend();
    return observable(target[key]);
  },
  set(target, key, value) {
    target[key] = value;
    // notify
    let deps = depsStorage.get(target);
    if (!deps) {
      return;
    }
    const dep = deps[key];
    if (dep) {
      dep.notify();
    }
  } };

const observedValues = new WeakMap();
function observable(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (observedValues.has(obj)) {
    return observedValues.get(obj);
  }
  // check if obj is an already observed value
  const observed = new Proxy(obj, handlers);
  observedValues.set(obj, observed);
  return observed;
}

function makeRunner() {
  return function runner(job) {
    Dep.job = job;
    job();
    Dep.job;
  }
}

function addDepIfFunction(runner) {
  return function(dep) {
    if (dep instanceof Function) runner(dep);
  }
}

function arrBind(f) {
  return function(x) {
    return Array.prototype.concat.apply([], x.map(f));
  }
}

function wrapVars(initializer, runner) {
  return initializer(function() {
    var initialDeps = [].slice.call(arguments);
    if (initialDeps) {
      arrBind(runner)(initialDeps instanceof Array ? initialDeps.slice(0) : (typeof initialDeps === 'object' ? Object.keys(initialDeps) : [ initialDeps ]));
    }
    return runner;
  }); 
}

function collectArgs(f, state) {
  return function(collectInitial) {
    return f(state, collectInitial);
  }
}

function factory(data) {
  return function(f) {
    return wrapVars(collectArgs(f, observable(data)), addDepIfFunction(makeRunner()));
  }
}

function tester() {
  return factory({ x: 1 })((state, initialize) => {
    return initialize(
      function renderY() {
        document.getElementById("y").innerText = `y = x + 1 = ${state.x + 1}`;
      },

      function renderState() {
        document.getElementById("state").innerText = JSON.stringify(state, null, 2);
      },

      function() {
        document.getElementById("x").innerText = `x = ${state.x}`;
      }
    );
  });
}

module.exports = factory;

module.exports.default = factory;
