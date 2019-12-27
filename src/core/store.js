'use strict';

(function() {
    var sys = [].slice.call(arguments).apply().load('sys');

    module.exports = sys;

    module.exports.default = sys;

    return (self.sys = sys);
})(

    (function MakeApp(_) {
        return _.apply(undefined, [].slice.call(arguments, 1));
    })(
        (function run(init, base, parse) {
            return function(sys, root) {
                return parse.apply(base.call(init(sys, root)), [].slice.call(arguments, 2));
            }
        }),
        (function init(sys, base) {
            return base.shift().apply(sys, base);
        }),
        (function base() {
            this.location().save('loc');

            this.load('loc').lift(function(s, f) {
                return f && f instanceof Function ? f.call(s, this) : s;
            }).run('sys').save('sys');

            this.load('loc').lift(function(ctor, v) {
                var def = v instanceof Function ? v.call(this) : v;
                if (def.klass && def.klass.name == 'Bind') {
                    def.ext.unshift(def.ext.remove(2).shift().call(undefined, this.load('loc').run('utils.extend'),
                        { pure: true, arr: true, val: true, cont: false, other: true, done: true }));
                }
                if (def.parent) {
                    ctor.find(def.parent).parse(def);
                }else {
                    ctor.parse(def);
                }
                return this;
            }).run('types.type').save('make');
            return this;
        }),
        (function parse() {
            return this.map(function(i) {
                return i.reduce(function(r, v) {
                    if (v[0] && v[0].name && v[0].name.substr(0, 2) == '$$') {
                        v.shift().apply(r, v);
                    }else {
                        var make = r.load('make');
                        while (v.length) {
                            make.run(v.shift());
                        }
                    }
                    return r;
                }, this);
            }).save('parse').run([].slice.call(arguments));
        })
    ),

    (function MakePure() {
        // ===== expose pure to array and pass it on ==== //
        return [].slice.call(arguments).shift();
    })(
        (function core(s, u, c, e, r, n, w, t, p, d, i) {
            return { define: self.define = d, is: i, isWorker: w, log: t(console.log.bind(console)), fn: s.call({}, self.unit = u, c, e, p, r, n) };
        })(
            (function sys(u, c, e, p, r, n) {
                this.unit     = u;
                this.$const   = c;
                this.extract  = e;
                this.pure     = p;
                this.curry    = r;
                this.now      = n;
                return this;
            }),
            // ==== identity ======== //
            (function unit(t) {
                return t;
            }),
            // ==== constant ======== //
            (function $const(a) {
                return function() {
                    return a;
                }
            }),
            (function extract(fn) {
                return fn(unit);
            }),
            (function curry(fn, bound, numArgs, countAllCalls) {
                if (((numArgs = numArgs || fn.length) < 2)) return fn;
                else if (!bound && this != self) bound = this;

                var countAll = countAllCalls !== false;
                return function f(args) {
                    return function $_curry() {
                        var argss = [].slice.apply(arguments);
                        if (countAll && !argss.length) argss.push(undefined);
                        if ((args.length + argss.length) === numArgs) {
                            return fn.apply(bound, args.concat(argss));
                        }else {
                            return f(args.concat(argss));
                        }
                    }
                }([]);
            }),
            (self.now = (function(run) {
                return run();
            })(
                (function() {
                var perf = self.performance;
                if (perf && (perf.now || perf.webkitNow)) {
                    var perfNow = perf.now ? 'now' : 'webkitNow';
                    return perf[perfNow].bind(perf);
                }else { return Date.now; }
            }))),
            (function() {
                return (self.document === undefined);
            })(),
            (function tap(f) {
                return function(x) {
                    return unit(x, f(x));
                }
            }),
            (function(pure) {
                this.pure = function() {
                    return pure(Array.apply(arguments));
                };
                this.of = function() {
                    return [].slice.call(arguments);
                };
                return pure;
            }).call(Array,
                // ===== wraps the array in pure ==== //
                (function MakePure($pure) {
                    this.prototype.pure = function(idx, remove) {
                        return typeof idx != 'undefined' &&
                            idx < this.length && this[idx] instanceof Function
                                ? (remove ? this.remove(idx).at(0)(this) : this[idx](this)) : $pure(this);
                    };
                    return $pure;
                }).call(Array,
                    (function(t) {
                        return function $_pure(f) {
                            return f(t);
                        }
                    })
                ),
                // ===== calls fn over array: [ fn.apply(undefined, arg1, arg.., arg...) ] ==== //
                (function MakeApply($apply) {
                    this.prototype.apply = function(idx, recur) {
                        if (recur || idx === true) {
                            return $apply(this);
                        }else if (idx instanceof Function) {
                            return idx.apply(undefined, this.slice(0));
                        }else {
                            return this[idx||0].apply(undefined, this.slice((idx||0)+1));
                        }
                    };
                }).call(Array,
                    (function apply(bind) {
                        return function $apply(x) {
                            if (x instanceof Array) {
                                return bind($apply)(x).apply();
                            }else {
                                return x;
                            }
                        }
                    })(
                        (function bind(f) {
                            return function(x) {
                                return Array.prototype.concat.apply([], x.map(f));
                            }
                        })
                    )
                ),
                // ===== more functional array ====== //
                (function MakeArray() {
                    String.prototype.$_like = new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
                    String.prototype.$_matches = String.prototype.$like = function() {
                        var search = this.replace(this.$_like, "\\$1");
                        search = search.replace(/%/g, '.*').replace(/_/g, '.');
                        return RegExp('^' + search + '$', 'gi');
                    };
                    String.prototype.matches = String.prototype.like = function(search) {
                        if (typeof search !== 'string' || this === null) { return false; }
                        return search.$like().test(this);
                    };
                    String.prototype.isLowerCase = function(from, to) {
                        return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isLowerCase() : (this.toLowerCase() == this);
                    };
                    String.prototype.isUpperCase = function(from, to) {
                        return typeof from == 'number' ? this.substr(from, to || (this.length - from - 1)).isUpperCase() : (this.toUpperCase() == this);
                    };
                    String.prototype.toCamel = function(){
                        return this.length < 3 ? this.toLowerCase() : this.replace(/\$/g, '').replace(/(^[a-z]{1}|\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
                    };
                    String.prototype.toDash = function() {
                        return this.length < 2 ? this.toLowerCase() : this.replace(/([A-Z])/g, function($1, p1, pos){return (pos > 0 ? "-" : "") + $1.toLowerCase();});
                    };
                    String.prototype.toTypeCode = function() {
                        return [ '$', this.toLowerCase().split('$').pop().toDash() ].join('');
                    };
                    String.prototype.toTypeName = function() {
                        return this.replace(/-/g, '').replace('$', '').substr(0, 1).toUpperCase() + this.slice(1);
                    };
                    String.prototype.toRegular = function() {
                        return this.length ? this.toTypeCode().replace('$', '') : '';
                    };
                    String.prototype.toKey = function() {
                        return this.length ? this.substr(0, 1).toLowerCase().concat(this.slice(1)) : this;
                    };
                    this.prototype.insert = function(position) {
                        this.push.apply(this, this.splice(0, position).concat([].slice.call(arguments, 1)).concat(this.splice(0)));
                        return this;
                    };
                    this.prototype.of = function() {
                        return this[0](this.slice(1));
                    };
                    this.prototype.at = function(index) {
                        return this.length && index < this.length ? this[index] : [];
                    };
                    this.prototype.first = function() {
                        return this.length ? this.at(0) : [];
                    };
                    this.prototype.last = function() {
                        return this.length ? this.at(this.length - 1) : [];
                    };
                    this.prototype.bimap = function(f, i) {
                        return typeof i == 'undefined' ? this.map(f) : this.slice(0, 1).concat(this.slice(i).map(this.fn.bin(f)(this.first())));
                    };
                    this.prototype.until = function(index) {
                        return this.length ? this.splice(0, index) : [];
                    };
                    this.prototype.remove = function(index, howmany) {
                        return this.length ? this.splice(index, howmany || 1) : [];
                    };
                    this.prototype.flat = this.prototype.flatten = function() {
                        return Array.prototype.concat.apply([], this);
                    };
                    this.prototype.obj = function() {
                        var values = [].slice.call(arguments).flat();
                        return this.reduce(function(r, v, i) {
                            if (!v) return r;
                            else if (values.length) r[v] = values[i];
                            else if (v.name) r[v.name] = v;
                            return r;
                        }, {});
                    };
                    this.prototype.prepend = function() {
                        return (0*this.unshift.apply(this, [].slice.call(arguments).flat())) || this;
                    };
                    this.prototype.append = function() {
                        return (0*this.push.apply(this, [].slice.call(arguments).flat())) || this;
                    };  
                    this.prototype.replace = function(f, i) {
                        return this.splice(index, 1, this.at(i));
                    };
                    this.range = function(m, n) {
                        return Array.apply(null, Array(n - m + 1))
                        .map(function (n, x) {
                            return m + x;
                        });
                    };
                }).call(Array)
            ),
            // ==== fake require.js define function === //
            (function(a, d, r) {
                return a(d(r));
            })(
                (function(d) {
                    return d;
                }),
                (function(require) {
                    return function define() {
                        var args  = [].slice.call(arguments), test,
                            deps  = args.first() instanceof Array ? args.shift() : [],
                            func  = args.first(),
                            klass = sys.klass('Cont'), cont, node;
                        if (func.length) {
                            if (func.name == '$_store') {
                                node = require()
                                args.push(node);
                                cont = args.apply();
                                cont.ref = node.uid();
                                return cont;
                            }else {
                                args.push(unit, {}, {});
                                args.apply();
                                test = require().set('cont', args.slice(2).reduce(function(r, v, i) {
                                    if (r.length) {
                                        return r;
                                    }else if (v.exports) {
                                        r.push(v.exports);
                                    }
                                    return r;
                                }, []).shift());
                            }
                        }else {
                            test = sys.load('sys').run(args.first());//args.apply();
                        }
                        if (test instanceof Array) {
                            debugger;
                        }else if (klass.test(test.constructor)) {
                            if (!test.ref) {
                                node = require(test);
                                return node.set('cont', test.attr('ref', node.uid()));
                            }else {
                                return test;
                            }
                        }else {
                            if ((node = sys.get('script').get(test.name) || require(test))) {
                                cont = node.get('cont');
                                if (cont) return cont;
                                else if (test && (cont = klass.of(test))
                                    && cont.attr('name', test.name))
                                        cont.attr('ref', node.uid());
                                return node.set('cont', cont);
                            }
                        }
                        return node || cont || test;
                    };
                }),
                (function require(def) {
                    var path, head, tag, type, node, ref;
                    if (def && def.ref) {
                        return sys.find(def.ref);
                    }else if (def && def.name) {
                        path = def.name.split('.');
                        type = path.first();
                        if (path.length == 1) {
                            if (node = sys.get('script').get('components', path, path.last())) {
                                return node;
                            }else if (node = sys.get('script').get('libs', path)) {
                                return node;
                            }
                        }else if (type == 'modules' || type == 'lsibs') {
                            path.append(path.last());
                        }
                        return sys.get('script').get(path);
                    }else {
                        head = document.getElementsByTagName('head').item(0).getElementsByTagName('script');
                        tag  = head.item(head.length-1);
                        ref  = tag.getAttribute('data-ref');
                        return sys.find(ref);
                    }
                })
            ),
            (function is(v) {
                return v && v instanceof this.ctor.base ? true
                : (v && v.name && this.ctor.find(v.name) ? true : (v && v.base == this.ctor.base ? true : false));
            })
        )
    ),

    (function MakeRoot() {

        return [].slice.call(arguments);
    })(
        // === INIT === //
            (function(CTOR, Data, Store, Utils, Parse, Node, Functor, Compose, Cont, Reader) {

                var $Base  = CTOR.shift().apply(this, CTOR);
                var $CTOR  = new $Base($Base);
                var $Data  = $CTOR.parse(Data);
                var $Store = $CTOR.parse(Store);

                $Data.add();
                $Store.add();

                var $Base    = $CTOR.$store.set('type', $CTOR).$store.root;
                var $Utils   = Parse(this, Utils($Base.child('utils')));
                var $Root    = $CTOR.parse(Node).$store.root;
                var $Sys     = $Root.set('sys', this);
                var $Functor = $CTOR.parse(Functor);
                var $Compose = $Functor.parse(Compose);
                var $Cont    = $Compose.parse(Cont);
                var $Reader  = $Compose.parse(Reader);

                return $Reader.of();
            }),
        // === CTOR === //
            (function CTOR() {
                return [].slice.call(arguments);
            })(
                (function(ctor, proto, make, named, base) {
                    base.prototype.sys = this.fn.$const(this);
                    return named.call(make.call(proto.call({ ctor: ctor, base: base })));
                }),
                (function $CTOR(ctor, attrs, parent) {
                    this.ctor(ctor, attrs, parent);
                }),
                (function() {
                    this.ctor.prototype = {
                        constructor: this.ctor,
                        of: function(ctor, attrs, parent) {
                            return new this(ctor, attrs, parent);
                        },
                        is: function(value) {
                            if (this.__) return value && value instanceof this.__;
                            else if (this.$ctor && this.$ctor.__) return value && value instanceof this.$ctor.__;
                            else if (this.$ctor) return value && value instanceof this.$ctor;
                        },
                        base: this.base,
                        sys: this.base.prototype.sys,
                        ctor: function(ctor, attrs, parent) {
                            this.$ctor = ctor;
                            this.$code = this.constructor.name.toLowerCase();
                            this.prop('id', this.makeID(ctor.name.replace('$', '').substr(0, 2).toUpperCase()));
                            this.init(ctor, attrs, parent);
                        },
                        init: function(ctor, attrs, parent) {
                            if (this instanceof ctor) {
                                ctor.prototype._level = 0;
                                ctor.prototype.root = this.sys().fn.$const(this);
                                ctor.prototype.tid = this.makeID(100000);
                            }else {
                                if (parent) this._parent = parent.$code;
                                this.constructor.prototype._level = parent ? (parent._level + 1) : 0;
                                ctor.ctor = ctor.prototype.ctor = this.add();
                            }
                            if (!ctor.prototype.$super) ctor.prototype.$super = this.$super;
                            if (attrs && attrs instanceof Function) {
                                ctor.prototype.ctor = attrs;
                            }else if (typeof attrs == 'object') {
                                this.mixin(attrs, ctor);
                            }
                            if (!ctor.of) ctor.of = parent ? parent.$ctor.of : this.of;
                            this.of = this.$ctor.$of = ctor.of.bind(ctor);
                            if (ctor.pure) this.pure = ctor.$pure = ctor.pure.bind(ctor);
                            else this.pure = ctor.$pure = this.of;
                            if (ctor.lift) this.lift = ctor.$lift = ctor.lift.bind(ctor);
                            if (!ctor.prototype.to) ctor.prototype.to = this.to;
                            if (!ctor.prototype.is) ctor.prototype.is = this.is;
                        },
                        parent: function(name) {
                            var type = name ? this.find(name) : this;
                            var prnt = this.find(type._parent);
                            var args = [].slice.call(arguments, 1);
                            return prnt ? (args.length ? prnt.get(args.join('.')) : prnt) : null;
                        },
                        add: function() {
                            var parent = this.parent();
                            if (parent && parent.$store) this.$store = parent.$store.child(this.$code);
                            if (this.$store) this.$index.set(this.$code, this.$store.set('type', this).$store.uid());
                            return this;
                        },
                        update: function(base, ext, keys) {
                            var xtnd = this.xtnd || (this.root().prop('xtnd', this.sys().get('utils.extend')));
                            if (!base) {
                                return ext ? xtnd({}, ext) : {};
                            }else if (!ext) {
                                return xtnd({}, base);
                            }else if (keys) {
                                var result = xtnd({}, base);
                                return Object.keys(ext).reduce(function(r, k, i) {
                                    if (r[k]) r[k] = xtnd(xtnd({}, r[k]), ext[k]);
                                    else r[k] = ext[k];
                                    return r;
                                }, result);
                            }else {
                                return xtnd(xtnd({}, base), ext || {});
                            }
                        },
                        mixin: function(items, target, values) {
                            if (!(items instanceof Array && typeof items == 'object'))
                                return this.mixin(Object.keys(items), target, items)

                            return items.reduce(function(r, v) {
                                if (values && values[v]) {
                                    r[v] = typeof values[v] == 'object' && values[v].value ? values[v].value : values[v];
                                }else {
                                    r[v.name] = typeof v == 'object' && v.value ? v.value : v;
                                }
                                return r;
                            }, target);
                        },
                        create: function(/* name, ctor */) {
                            var args = [].slice.call(arguments);
                            var ctor = args[0] instanceof Function ? args.shift() : (args.length > 1 ? args.pop() : null);
                            var name = typeof args[0] == 'string' ? args.shift() : (ctor ? ctor.name : this.$ctor.name);
                            var child = this.named(name);
                            child.prototype = { constructor: child, ctor: ctor };
                            return this.extend(child);
                        },
                        inherit: function(ctor, parent, props) {
                            var F = function() {};
                            F.prototype = parent.prototype;
                            var proto = new F(), keys = Object.keys(ctor.prototype);
                            if (props) this.mixin(props, proto);
                            if (keys.length && ctor.prototype.constructor == ctor) {
                                ctor.prototype = keys.reduce(function(r, k, i, o) {
                                    r[k] = ctor.prototype[k];
                                    return r;
                                }, proto);
                            }else {
                                proto.constructor = ctor;
                                ctor.prototype = proto;
                            }
                            return ctor;
                        },
                        make: function(ctor, proto) {
                            if (proto && proto instanceof Function) {
                                return proto.call(ctor, this.sys);
                            }else if (proto && typeof proto == 'object') {
                                this.mixin(proto, ctor.prototype);
                            }
                            return ctor;
                        },
                        child: function(ctor, proto, attrs) {
                            var klass = this.inherit(this.named(('$'+ctor.name).replace('$$', '$'), true, true), this.constructor);
                            var $ctor = ctor instanceof Function ? ctor : this.named(ctor.name.toTypeName(), false, false, true);
                            klass.$ctor = this.$code != '$ctor' ? this.inherit($ctor, this.$ctor, proto) : this.inherit($ctor, this.base, proto);
                            return klass;
                        },
                        extend: function(ctor, proto, attrs) {
                            var child  = ctor instanceof Function ? ctor : (typeof ctor == 'string' ? { name: ctor } : 'Child');
                            var exists = this.$store ? this.$store.get(child.name.toTypeCode()) : null;
                            if (exists) return exists.get('type');
                            var klass  = this.child(child, proto, attrs);
                            if (!klass.$ctor.prototype.__) klass.$ctor.prototype.__ = klass.$ctor;
                            if (!klass.$ctor.prototype.kid) klass.$ctor.prototype.kid = this.kid;
                            return new klass(klass.$ctor, attrs, this);
                        },
                        parse: function(def) {
                            var type  = def instanceof Function ? def.call(this) : def;
                            var ctor  = type.klass || type.ctor;
                            var proto = type.ext instanceof Function ? type.ext.call(this.sys()) : type.ext;
                            var attrs = type.attrs;
                            var klass = this.extend(ctor, proto, attrs);
                            if (type.init) type.init.call(this, type, klass, this.sys());
                            return klass;
                        },
                        $super: function() {
                            var level = this.__level__ || 0, parent = this.ctor;
                            if (level++ < this.ctor._level) {
                                while (level--) {
                                    parent = parent.parent();
                                }
                                this.__level__ = this.ctor._level - parent._level;
                                if (parent._level) {
                                    parent.$ctor.apply(this, arguments);
                                }
                            }
                        },
                        find: function() {
                            var args = [].slice.call(arguments).join('.').split('.');
                            var name = args.shift().toTypeCode();
                            var path = args.length ? args.join('.') : '';
                            if (name == '$ctor') {
                                var res = this.root();
                                if (path) res = res.$store.get(path);
                            }else {
                                var uid = this.$index.get(name);
                                var res = uid ? this.$index.find(uid, true) : null;
                                if (res) res = res.get(path || 'type');
                            }
                            return res;
                        },
                        get: function(prop) {
                            return !prop ? this.$store : (prop.substr(0, 4) == 'root' ? this.$store.root.get(prop.substr(5)) : this.$store.get(prop));
                        },
                        set: function(prop, value) {
                            return this.$store.set(prop, value);
                        },
                        proto: function(name) {
                            var $ctor = name ? this.find(name, 'type.$ctor') : this.$ctor;//this.get('type.$ctor');
                            if ($ctor) return $ctor.prototype;
                        },
                        ext: function(ext) {
                            return this.mixin(ext, this.$ctor.prototype);
                        },
                        prop: function(name, value) {
                            return value ? (this.$ctor.prototype[name] = value) : this.$ctor.prototype[name];
                        },
                        fromConstructor: function() {
                            var args = [].slice.call(arguments);
                            return args.length > 1 ? this.$ctor[args.shift()].apply(this.$ctor, args) : this.$ctor[args.shift()].call(this.$ctor);
                        },
                        item: function(name) {
                            var args = [].slice.call(arguments).join('.').split('.');
                            if (args.length < 2 && args[0]) return this.get('items', args.first()) || this.find(args.first(), 'items.' + args.first().toRegular());
                            else if (args.length < 3 && args.insert(1, 'items')) return this.find(args.join('.'));
                            else if (args.length) return this.find(args.shift()).item(args.join('.'));
                        },
                        type: function(name, fn) {
                            var type = this.get(name);
                            return type ? (fn ? type[fn] : type) : unit;
                        },
                        test: function(ctor) {
                            if (!ctor) return false;
                            else if (!ctor.prototype) return this.test(ctor.constructor);
                            return ctor.prototype && ctor.prototype.__ === this.$ctor.prototype.__ ? true : false;
                        },
                        ap: function(x) {
                            return x.map ? x.map(this.bind(function(comp, fn) {
                                return fn(comp);
                            })) : (x instanceof Function ? this.maybe(this).lift(x) : this.maybe(x).lift(this.bind(function(c, x, f) {
                                return f(x, c);
                            })));
                        },
                        to: function(type, fn) {
                            return this.map(this.klass(type).pure);
                        }
                    };
                    return this.ctor;
                }),
                (function(set, makeWithPrefix, makeWithoutPrefix) {
                    return set(function(prefix, start) {
                        return prefix === false ? makeWithoutPrefix({ start: start || 1000000, id: start || 1000000 })
                            : makeWithPrefix({ prefix: prefix, start: start || 1000000, id: start || 1000000 });
                    });
                })(
                    (function set(makeID) {
                        return function() {
                            this.prototype.makeID = makeID;
                            this.prototype.id = makeID('CT');
                            this.prototype.kid = makeID('', 100000);
                            return this;
                        }
                    }),
                    (function MakeID(counter) {
                        return function() {
                            return (counter.prefix + counter.id++);
                        }
                    }),
                    (function MakeID(counter) {
                        return function() {
                            return counter.id++;
                        }
                    })
                ),
                (function() {

                    return [].slice.call(arguments).apply();
                })(
                    (function(build, make, result, wrap) {
                        return function() {
                            this.prototype.named = wrap(build(make), result);
                            return this;
                        }
                    }),
                    (function(pure) {
                        var args = [];
                        var next = (function(f) { return f(args.shift()); });

                        var tmpl = [ 
                            pure('(function Make'), next, pure('() {'),
                                pure('return function '), next, pure('() {'),
                                    pure(' this._id = this.id();'),
                                    pure(' this.ctor.apply(this, arguments);'),
                                    pure(' this.$super.apply(this, arguments);'),// this.__level__ && !(this.__level__ = 0);'),
                                    pure(''),//this.__super__.apply(this, arguments);'),
                                    pure(''),//return this;'),
                                pure('}})();') ];

                        return function(k) {
                            return k(args, next, tmpl);
                        }
                    })(function(t) { return function(f) { return f(t); }}),
                    (function(args, next, tmpl) {
                        return function named(name, id, ctor, level, superr) {
                            args.push(name, name);
                            return tmpl.filter(function(v, i) {
                                return i < 6 || (i == 6 && id) || (i == 7 && ctor) || (i == 8 && level) || (i == 9 && superr) || i > 9;
                            }).map(this.extract).join('');
                        }
                    }),
                    (function(text) {
                        try {
                            return eval(text);
                        }catch(e) {

                        }
                    }),
                    (function(make, result) {
                        return function named() {
                            return result(make.apply(this.sys().fn, [].slice.call(arguments)));
                        }
                    })
                ),
                (function() {
                    this.prototype = {
                        klass: function(name) {
                            return this.ctor.find(name);
                        }
                    };
                    return this;
                }).call((function Base() {}))
            ),
        // === Data === //
            (function() {
                return {
                    klass: function Data() {
                        this._base  = this._uid = this.root.base;
                        this._id    = this._uid;
                        this._ref   = this.root.val;
                        this._loc   = [];
                        this._cache = {};
                    },
                    ext: [
                        (function root() {
                            return { name: 'root', base: 1000000, val: [] };
                        })(),
                        (function $locate(nid, loc) {
                            var uid = nid - this._base;
                            var idx = 0, lvl = 0, div = 1000, val = this._ref;
                            while (val && ++idx < 4) {
                                lvl = uid < div ? 0 : ((uid - uid%div) / div);
                                uid = uid - (div * lvl); div = div / 10;
                                while (val.length <= lvl) { val.push([]); }
                                if (loc) loc.push(lvl);
                                val = val[lvl];
                            }
                            return loc || val;
                        }),
                        (function $load(loc) {
                            return this._ref[loc[0]][loc[1]][loc[2]];
                        }),
                        (function locate(nid, loc) {
                            return (this._val = this.$locate(nid, loc));
                        }),
                        (function check(nid) {
                            return (!nid || nid < this._base || nid > this._uid) ? false : true;
                        }),
                        (function find(nid, full) {
                            if (!this.check(nid)) return;
                            var val = this.$locate(nid);
                            return val ? (full ? val[nid%10] : val[nid%10][1]) : null;
                        }),
                        (function cached(nid, full) {
                            if (!this.check(nid)) return;
                            var val = this.$load(this._cache[nid] || (this._cache[nid] = this.$locate(nid, [])));
                            return val ? (full ? val[nid%10] : val[nid%10][1]) : null; 
                        }),
                        (function retrieve(nid, cached) {
                            return cached ? this.cached(nid) : this.find(nid);
                        }),
                        (function push(val, item) {
                            return val[(val.push((this._loc = [ [], item ]))-1)][0];
                        }),
                        (function add(item) {
                            if (this._uid%10==0) this._val = null;
                            item._uid = this._uid++;
                            return this.push(this._val || (this._val = this.locate(this._uid)), item);
                        })
                    ],
                    attrs: [
                        (function of() {
                            return new this();
                        })
                    ],
                    add: function(root) {
                        return function(store) {
                            return root.add(store);
                        };
                    },
                    data: function(type, klass, add) {
                        return function(fn) {
                            return fn((klass.constructor.prototype.$store = new klass.$ctor()), add);
                        }
                    },
                    init: function(type, klass, sys) {
                        this.$data = type.data(this, klass, type.add);
                    }
                };
            }),
        // === Store === //
            (function() {
                return {
                    klass: function Store(ref, name) {
                        this._val = this.$data(this);
                        this._cid = name || 'root';
                        this._ids = [];
                        this._map = {};

                        if (ref) this._ref = this.is(ref.parent) ? ref.parent : ref;
                    },
                    ext: [
                        (function cid() {
                            return this._ref ? this._ref.cid() : this._cid;
                        }),
                        (function uid() {
                            return this._uid;
                        }),
                        (function nid() {
                            return ''+this._uid;
                        }),
                        (function of(ref, ctor, name) {
                            return ctor ? new ctor(ref, name) : new this.constructor(ref, name);
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function identifier(asArray, recalc) {
                            return this._ref ? this._ref.identifier(asArray, recalc) : this._identifier(asArray, recalc);
                        }),
                        (function store() {
                            return this;
                        }),
                        (function index(key) {
                            return this._map[key];
                        }),
                        (function keys(index) {
                            return typeof index == 'number' ? this._ids[index] : this._ids;
                        }),
                        (function vals() {
                            return this._val;
                        }),
                        (function get(key) {
                            if (!key && typeof key == 'undefined') return this._ref;
                            else if (key && typeof key == 'string' && key.indexOf('.')>=0) return this.path(key);
                            else return typeof key == 'string' && (key || this._map[key]>=0) ? this._val[this._map[key]] : this._ref;
                        }),
                        (function val(key) {
                            return key && typeof key == 'string' && this.has(key) ? this._val[this._map[key]] : this.get(key);
                        }),
                        (function initial(key) {
                            var ref = this._ref;
                            while (ref && ref instanceof this.constructor) {
                                ref = ref._ref;
                            }
                            return key ? ref.get(key) : ref;
                        }),
                        (function current() {
                            return this.get(this.get('key')||'vals');
                        }),
                        (function apply(fn, ctx) { // args
                            if (typeof fn == 'string') {
                                var target = this.get(fn);
                                var args   = Array.prototype.slice.call(arguments, 1);
                                if (target instanceof Function) return target.apply(ctx || this, args);
                            }else if (fn instanceof Function) {
                                var args   = Array.prototype.slice.call(arguments, 1);
                                return fn.apply(ctx || this, args);
                            }
                        }),
                        (function parent(key) {
                            return this._ref && !(this._ref instanceof this.__) ? this._ref.parent(key) : (key ? this._ref.get(key) : this._ref);
                        }),
                        (function at(index) {
                            return this._val.length && index < this._val.length ? this._val[index] : null;
                        }),
                        (function has(key) {
                            return this.index(key) >= 0 ? true : false;
                        }),
                        (function set(key, value) {
                            return (this._val[(this._map[key] >= 0 ? this._map[key] : (this._map[key] = (this._ids.push(key)-1)))] = value);
                        }),
                        (function push(key, value) {
                            return arguments.length > 1 ? ((this.get(key) || this.set(key, [])).push(value)) : this.push('vals', key);
                        }),
                        (function add(name, ref) {
                            return this.set(name, this.is(ref) ? ref : this.constructor.of(ref || this, name));
                        }),
                        (function child(name, ctor, ref) {
                            var opts = typeof name == 'object' ? name : {};
                            if (typeof name == 'string') opts.name = name;
                            else if (name && name.name) opts.name = name.name;
                            return this.get(opts.name) || this.set(opts.name, this.of(this, ctor, name));
                        }),
                        (function node(name, ref) {
                            return this.child(name, this.__, ref);
                        }),
                        (function ensure() {
                            var path = [].slice.call(arguments).flat().join('.').split('.');
                            var node = this, test = node, key;
                            while (node && path.length && (key = path.shift())) {
                                if ((test = node.get(key))) node = test;
                                else node = node.child(key);
                            }
                            return node;
                        }),
                        (function ref(value) {
                            return value ? (this._ref = value) : this._ref;
                        }),
                        (function length() {
                            return this._val.length;
                        }),
                        (function clear(id) {
                            var node = this, vals;
                            if (!node || !node.length || !node.length()) {
                                return node;
                            }else if (!id) {
                                vals = node.values();
                                node._map = {};
                                node._ids.splice(0);
                                node._val.splice(0);
                                return vals;
                            }else {
                                var idx = node._map[id],
                                idxs = sys().get('utils.values')(node._map),
                                keys = sys().get('utils.keys')(node._map),
                                val  = [].concat(node._val.splice(0)),
                                pos  = 0,
                                del  = [],
                                tmp;

                                node._map = {};
                                node._ids.splice(0);
                                while(pos < val.length) {
                                    if (id != keys[pos]) {
                                        tmp = val[idxs[pos]];
                                        if (tmp.isStore) node.add(keys[pos], tmp);
                                        else node.set(keys[pos], tmp);
                                    }else {
                                        del.push([ keys[pos], val[idxs[pos]] ]);
                                    }
                                    pos++;
                                }
                                return del.reduce(function(r, v, i) {
                                    r[v[0]] = v[1].isStore ? v[1].values() : v[1];

                                    return r;
                                }, {});
                            }
                        }),
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function values(recur) {
                            var node = this;
                            return node._val.reduce(function(result, value, index) {
                                result[node._ids[index]] = recur && node.is(value)
                                    ? value.values(typeof recur == 'number' ? (recur - 1) : recur) : value;
                                return result;
                            }, {});
                        }),
                        (function convert() {
                            return this.parse.apply(this, [].slice.call(arguments));
                        }),
                        (function map(f) {
                            var arr = [], store = this;
                            this._val.forEach(function(v, i) {
                                arr.push(f(v,store._ids[i],i,store));
                            });
                            return arr;
                        }),
                        (function $bind(b) {
                            return function bind(f, r) {
                                return this._val.bind(b(f, r || {}, this));
                            }
                        })(
                            (function bind(f, x, s) {
                                return function $fn(v, i, o) {
                                    var k = s && s.keys ? s.keys(i) : v.name;
                                    if (s && s.is && s.is(v) && v._val.length) return v._val.bind(bind(f, (x[k] = {}), v));
                                    else if (v instanceof Array && v.length) return v.bind($fn);
                                    return (x[k] = f(v, k, i, s && s._ref ? s.ref() : o) || v);
                                };
                            })
                        ),
                        (function find(value, cached) {
                            return value ? this.db.retrieve(typeof value == 'object' ? (value._uid || value._id || value.uid) : value, cached) : null;
                        }),
                        (function info(/* recur, msg, opts */) {
                            var args  = [].slice.call(arguments);
                            var recur = (args.length && typeof args[0] == 'boolean' ? args.shift() :
                                        (args.length && typeof args[args.length-1] == 'boolean' ? args.pop() : false));
                            var msg   = (args.length && typeof args[0] == 'string' ? args.shift() : '');
                            var opts  = (args.length && typeof args[0] == 'object' ? args.shift() : null);
                            var count = 0, bind = this.bind(function(x, k, i, o) {
                                var info = msg ? [ msg ] : [];
                                if (o && o.is) {
                                    info.push(o.identifier(), k, x, i, o.uid(), o.store().is(x) ? 'store' : 'value', count);
                                }else {
                                    info.push(x, o, i, count);
                                }
                                console.log(info);
                                count++;
                                return x;
                            }, opts);
                            return bind;//recur ? bind.bind(unit, opts) : bind;
                        }),
                        (function object(k) {
                            return { '$$': true, value: this.get(k), key: k, index: this.index(k), ref: this.identifier(), object: this };
                        }),
                        (function(test, run) {
                            return function search(expr, recur) {
                                return this.vals().select(test(expr.$like()), run(recur));
                            }
                        })(
                            (function(expr) {
                                return function(x) {
                                    if (!x) return false;
                                    else if ((typeof x == 'string' && expr.test(x))
                                      || (x.key && typeof x.key == 'string' && expr.test(x.key))
                                        || (x.ref && typeof x.ref == 'string' && (expr.test(x.ref) || expr.test(x.ref.concat('.', x.key))))) {
                                        return true;
                                    }
                                }
                            }),
                            (function(recur) {
                                return function(x) {
                                    var o = x && x['$$'] ? x.value : x;
                                    return o && o.vals && o.length() ? (recur ? o.map(function(v, k, i, o) {
                                        return o.object(k);
                                    }) : o.parent().object(o.cid())) : x;
                                }
                            })
                        ),
                        (function walk(run) {
                            return function walk(key, callback) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0);
                                return run(parts, callback)(this);
                            }
                        })(
                            (function walk(parts, callback) {
                                return function next(node) {
                                    var key = parts.first() == 'parent' ? parts.first() : parts.shift();
                                    var val = key == 'parent' ? node.parent() : node.get(key);
                                    if (val) {
                                        if (callback(val, key, node)) {
                                            return val;
                                        }else {
                                            return val && node.is(val) && parts.length ? next(val) : null;
                                        }
                                    };
                                }
                            })
                        )
                    ],
                    attrs: [
                        (function of(ref, name) {
                            return new this(ref, name);
                        })
                    ],
                    make: function(klass) {
                        return function(root, data) {
                            return function(store) {
                                return (klass.$ctor.prototype.$data = data(unit(klass.$ctor.prototype.db = root)))(store);
                            }
                        }
                    },
                    find: function() {
                        return this.ctor.find.apply(this.ctor, [].slice.call(arguments));
                    },
                    init: function(type, klass, sys) {
                        klass.$ctor.prototype.isStore = true;
                        klass.$ctor.prototype.$data = this.$data(type.make(klass));
                        sys.root  = klass.$ctor.prototype.root = unit(new klass.$ctor());
                        sys.klass = type.find;
                        var store = this.constructor.prototype.$store = sys.root.child('types');
                        var index = this.constructor.prototype.$index = store.child('index');
                    }
                };
            }),
        // === Parse === //
            (function() {

                return [].slice.call(arguments).flat().apply();
            })(
                // === Create parse & import combined === //
                    (function(parseArgs, getArgs, makeArgs, importFuncs) {
                        return function(utils) {
                            utils.set('parseArgs', parseArgs);
                            utils.set('getArgs', getArgs);
                            utils.set('makeArgs', makeArgs);
                            utils.set('importFuncs', importFuncs.bind(utils));
                            return utils;
                        }
                    }),
                // === Find $_ values === //
                    (function() {
                        var args = [].slice.call(arguments);
                        return args.slice(1).prepend(args.apply());
                    })(
                        (function $_parseArgs(getArgs, makeArgs) {
                            return function parseArgs(f, r, i) {
                                if (f.name.substr(0, 2) == '$_') {
                                    return makeArgs(f, getArgs(f), r, i);
                                }else {
                                    return f;
                                }
                            }
                        }),
                        (function getArgs(func) {
                            // Courtesy: https://davidwalsh.name/javascript-arguments
                            var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
                            return args.split(',').map(function(arg) {
                                return arg.replace(/\/\*.*\*\//, '').trim();
                            }).filter(function(arg) { return arg; });
                        }),
                        (function makeArgs(func, args, source, isStore) {
                            return func.apply(undefined, args.map(function(a, i, r) {
                                return isStore ? source.get(a.replace('$_', '')) : source[a.replace('$_', '')];
                            }));
                        })
                    ),
                // === Determine $_ args === //
                    (function importFuncs(items, target, values) {
                        if (!(items instanceof Array) && typeof items == 'object') return importFuncs(Object.keys(items), target, items);
                        var isStore   = target.isStore && target.set && target.get ? true : false;
                        var parseArgs = this.get('parseArgs');
                        return items.reduce(function(r, v) {
                            var func = values ? values[v] : (v.fn ? v.fn : v);
                            var name = values ? (v.name || v) : v.name;
                            var val  = name.substr(0, 2) == '$_' ? parseArgs(func, r, isStore) : func;
                            if (isStore) {
                                r.set(name.replace('$_', ''), val);
                            }else {
                                r[name.replace('$_', '')] = val;
                            }
                            return r;
                        }, target);
                    })
            ),
        // === Utils === //
            (function() {

                return [].slice.call(arguments).pure(0, true);
            })(
                // === import / parse === //
                    (function(items) {
                        return function(sys, utils) {
                            utils.set('$const', sys.fn.$const);
                            utils.set('curry', sys.fn.curry);
                            utils.set('point', items.shift().call({ curry: sys.fn.curry }));
                            utils.set('get', items.shift()(utils.get('importFuncs')(items, utils).get('path')));
                            utils.ctor.mixin([
                                { name: 'fn',     value: utils.get('func')   },
                                { name: 'select', value: utils.get('pass')(utils.get('select')) },
                                { name: 'bin',    value: utils.get('pass')(utils.get('bind')) },
                                { name: 'parse',  value: utils.get('parse')  }
                            ], utils.constructor.prototype);

                            return utils;
                        }
                    }),
                    (function() {
                        // map :: Monad m => (a -> b) -> m a -> m b
                        this.map = this.curry(function(fn, m) {
                            return m.map(fn);
                        });

                        // chain :: Monad m => (a -> m b) -> m a -> m b
                        this.chain = this.curry(function(fn, m) {
                            return m.chain(fn);
                        });

                        // ap :: Monad m => m (a -> b) -> m a -> m b
                        this.ap = this.curry(function(mf, m) { // mf, not fn, because this is a wrapped function
                            return mf.ap(m);
                        });

                        // orElse :: Monad m => m a -> a -> m a
                        this.orElse = this.curry(function(val, m) {
                            return m.orElse(val);
                        });

                        this.lift = this.curry(function(f, m) {
                            return m.lift(f);
                        });

                        this.lift2 = function(f, m1, m2) {
                            return m1.map(f).ap(m2);
                        };

                        this.lift2M = function(f, t1, t2) {
                            return this.curry(function(v1, v2) {
                                return (t1 ? t1(v1) : v1).map(f).ap(t2 ? t2(v2) : (t1 ? t1(v2) : v2));
                            }, this);
                        };

                        return this;
                    }),
                    (function get(make) {
                        return function(path) {
                            return function(obj) {
                                return make.bind({ fn: path.bind(obj) });
                            }
                        }
                    })(
                        (function() {
                            var args = [].slice.call(arguments);
                            return this.fn(args.length ? args.join('.') : undefined);
                        })
                    ),
                // === call and pass === //
                    (function call(f) {
                        return function() {
                            return f(this);
                        }
                    }),
                    (function call1(f) {
                        return function(x) {
                            return f(this, x);
                        }
                    }),
                    (function call2(f) {
                        return function(x, y) {
                            return f(this, x, y);
                        }
                    }),
                    (function pass(f) {
                        return function() {
                            return f(this).apply(undefined, arguments);
                        }
                    }),
                    (function apply(f) {
                        return function() {
                            return f.apply(this, arguments);
                        }
                    }),
                    (function _1(f) {
                        return function(t) {
                            return f(t);
                        };
                    }),
                    (function maybe(m) {
                        return function(l) {
                            return function(r) {
                                return m(l)(r);
                            }
                        }
                    }),
                    (function tuple(a) {
                        return function(b) {
                            return function(f) {
                                return f(a)(b);
                            }
                        }
                    }),
                    (function bin(f) {
                        return function(x) {
                            return function(y) {
                                return f(x, y);
                            }
                        }
                    }),
                    (function bind(a) {
                        return function(f) {
                            return function(b) {
                                return f(a, b);
                            }
                        }
                    }),
                    (function compose(f) {
                        return function(g) {
                            return function(a) {
                                return g(f(a));
                            }
                        };
                    }),
                    (function andThen(g) {
                        return function(f) {
                            return function(a) {
                                return g(f(a));
                            }
                        };
                    }),
                // === ext/prop/tar/_1/maybe/tup etc etc === //
                    (function extend(target, source) {
                        var hasOwnProperty = Object.prototype.hasOwnProperty;
                        for (var propName in source) {
                            if (hasOwnProperty.call(source, propName)) {
                                target[propName] = source[propName];
                            }
                        }
                        return target;
                    }),
                    (function property(fn) {
                        return function() {
                          var args = Array.prototype.slice.call(arguments);
                          return function(obj) {
                            return !obj || !fn ? null :
                              (fn instanceof Function ? fn.apply(obj, args) :
                                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null));
                          };
                        };
                    }),
                    (function target(obj) {
                        return function(fn) {
                          return function() {
                            var args = Array.prototype.slice.call(arguments);
                            return !obj ? null : (!fn ? obj :
                              (fn instanceof Function ? fn.apply(obj, args) :
                                (obj && obj[fn] && obj[fn].apply ? obj[fn].apply(obj, args) : null)));
                          };
                        };
                    }),
                    (function path(key, value) {
                        return !key ? this : key.split('.').reduce(function(result, key, idx, keys) {
                            if (!key || !result) {
                                return result;
                            }else if (!idx && result instanceof Function) {
                                result = null;
                            }else if (!idx && key == 'root' && result.isStore) {
                                result = result;
                            }else if (value && (idx == keys.length - 1)) {
                                result = result.set ? result.set(key, value) : (result[key] = value);
                            }else if (idx && (keys[idx-1] == 'fn' || keys[idx-1] == '$fn')  && result[key] instanceof Function) {
                                result = keys[idx-1] == '$fn' ? (result.isStore ? result.get(key) : result[key]) : result[key]();
                            }else if (result.isStore && key == '$fn' && (result = result.get(key))) {
                                
                            }else if ((key == 'fn' || key == '$fn') && result[keys[idx+1]] instanceof Function) {
                                result = result;
                            }else if (result.isStore) {
                                result = result.get(key) || (value ? result.child(key) : null);
                            }else if (result instanceof Array) {
                                result = result.get(key);
                            }else if (typeof result == 'object') {
                                if (key == '$fn') key = 'fn';
                                if (result && result.get) result = result.get(key) || result[key] || result[key.replace('-', '.')];
                                else result = result[key] || result[key.replace('-', '.')];
                            }
                            return result;
                        }, this);
                    }),
                // === objPath, isBaseType, toString === //
                    (function identifier(key) {
                        function calcOnce(node) {
                            var path = [], parent = node;
                            while ((parent = parent[key])) {
                                path.unshift(parent._cid);
                            };
                            path.push(node._cid);
                            if (node._cache) return (node._cache.identifier = path.slice(node._offset));
                            return path.slice(node._offset);
                        };
                        return function identifier(asArray, reCalc) {
                            var path = this._cache && this._cache.identifier && !reCalc ? this._cache.identifier : calcOnce(this);
                            return asArray === true ? path : path.join(typeof asArray == 'string' ? asArray : '.');
                        };
                    }),
                    (function objPath(name, target, value) {
                        var parts = name.split('.');
                        var curr  = target || self;
                        for (var part; parts.length && (part = parts.shift());) {
                            if (!parts.length && value !== undefined) {
                                curr[part] = value;
                            } else if (part in curr) {
                                curr = curr[part];
                            } else if (parts.length && value !== undefined) {
                                curr = curr[part] = {};
                            } else {
                                curr = null;
                                break;
                            }
                        }
                        return curr;
                    }),
                    (function isBaseType(value) {
                        if (!value || sys.run().is(value)) return false;
                        else if (typeof value == 'object') return (value.constructor === Object);
                        else if (value instanceof Function) return !value.klass || value === Function || value === Object;
                        return false;
                    }),
                    (function clone(o) {
                        if (o && typeof o == 'object' && o.constructor == Object) {
                            var r = {}; for (var key in o) {
                                if (o.hasOwnProperty(key)) {
                                    r[key] = clone(o[key]);
                                }
                            }
                            return r;
                        }else if (o && o instanceof Array) {
                            return o.map && o.map(function(v) { return clone(v); });
                        }
                        return o;
                    }),
                // === $map, $filter, $comprehension
                    (function $map(stream, f) {
                        return function(continuation) {
                            return stream(function(value) {
                                continuation(f(value));
                            });
                        };
                    }),
                    (function $filter(stream, f) {
                        return function(continuation) {
                            return stream(function(value) {
                                if (f(value)) {
                                    continuation(value);
                                }
                            });
                        };
                    }),
                    (function $_comprehension($_$map, $_$filter) {
                        return function comprehension(f_map, f_filter) {
                            return function(stream) {
                                stream = $_$map(stream, f_map);
                                if (f_filter) {
                                    stream = $_$filter(stream, f_filter);
                                }
                                return stream;
                            };
                        };
                    }),
                // === keys, values, object, assign, select etc etc === //
                    (function(nativeKeys, nativeHas) {
                        return function keys(obj) {
                            if (typeof obj != 'object') return [];
                            if (obj instanceof Array) return obj.map(function(v, i) {
                                return v && v.name ? v.name : i;
                            });
                            else if (obj instanceof Object || obj.constructor == Object) return nativeKeys(obj);
                            else if (obj.keys && obj.keys instanceof Function) return obj.keys();
                            else if (nativeKeys) return nativeKeys(obj);
                            var keys = [];
                            for (var key in obj) if (nativeHas.call(obj, key)) keys.push(key);
                            if (hasEnumBug) collectNonEnumProps(obj, keys); // Ahem, IE < 9.
                            return keys;
                        };
                    })(Object.keys, Object.hasOwnProperty),
                    (function $_values($_keys) {
                        return function values(obj, fn) {
                            var kys = $_keys(obj),
                            vals = [], usekeys = obj instanceof Array ? false : true,
                            useget = usekeys && obj.get && obj.get instanceof Function,
                            func = fn || unit;
                            for (var i = 0; i < kys.length; i++) {
                                vals.push(func(useget ? obj.get([kys[i]]) : (usekeys ? obj[kys[i]] : obj[i]), usekeys ? kys[i] : i));
                            };
                            return vals;
                        }
                    }),
                    (function $_length($_keys) {
                        return function length(item) {
                            return item.length ?
                                (item.length instanceof Function ? item.length() : item.length)
                                    : (typeof item == 'object' ? $_keys(item) : 0);
                        }
                    }),
                    (function $_object($_length, $_keys, $_values) {
                        return function obj(map, base) {
                            return function(values) {
                                var result = base || {}, keys;
                                if (!values && !this.document) values = this;
                                if (!values && map instanceof Array) {
                                    values = $_values(map); keys = $_keys(map);
                                }else {
                                    keys = map || $_keys(values);
                                }
                                for (var i = 0, len = $_length(keys); i < len; i++) {
                                    if (!keys[i] && !values) continue;
                                    else if (values) result[keys[i]] = values[i];
                                    else result[keys[i][0]] = keys[i][1];
                                }
                                return result;
                            };
                        };
                    }),
                    (function $_assign($_objPath) {
                        return function assign(obj) {
                            obj || (obj = {});
                            return function(val, key) {
                                if (val == '*' && key == '*') return obj;
                                else if (key && val) $_objPath(key, obj, val);
                                else if (val) obj = val;
                                return obj;
                            };
                        }
                    }),
                // === parse, select, each === //
                    (function $_parse($_keys, $_values) {
                        function run(node, data, recur, ctor) {
                            var keyss = $_keys(data), valss = $_values(data), value, key;
                            while (keyss.length) {
                                value = valss.shift(), key = keyss.shift();
                                if (typeof value == 'object' && key != 'args') {
                                    if (value instanceof Array && key == node._children) {
                                        var items = node.node(key);
                                        value.map(function(v) {
                                            return items.child(v, ctor || node.constructor);
                                        });
                                    }else if (node.is(value)) {
                                        node.set(value.cid(), value);                                   
                                    }else if (value.constructor != Object && value instanceof sys.ctor.base) {
                                        node.set(key.toKey(), value);
                                    }else if (recur) {
                                        run(node.child(key.toKey(), ctor), value, typeof recur == 'number' ? (recur - 1) : recur, ctor);
                                    }else {
                                        node.set(key.toKey(), value);
                                    }
                                }else if (typeof key == 'number' && value instanceof Array && value.length == 2 && typeof value[0] == 'string') {
                                    node.set(value[0], value[1]);
                                }else {
                                    node.set(key, value, false);
                                }
                            }
                            return node;
                        };
                        return function() {
                            var args = [].slice.call(arguments);
                            if (args.length < 3 && args[args.length-1] instanceof Function) {
                                return run(this, args.shift(), false, args.pop());
                            }else {
                                args.unshift(this);
                                return run.apply(undefined, args);
                            }
                        };
                    }),
                    (function $_select($_assign, $_keys) {
                        return function select(obj) {
                            return function select() {
                                var test  = Array.prototype.slice.call(arguments),
                                args  = test.length == 1 && test[0] instanceof Array ? test.shift() : test,
                                cont  = args.length && args[args.length-1] instanceof Function || args[args.length-1] === true ? args.pop() : false,
                                keyss = args.length == 0 ? $_keys(obj) : args.slice(0),
                                base  = args.length && typeof args[0] == 'object' && args[0].constructor == Object ? args.shift() : {},
                                coll  = cont ? [] : $_assign(base);
                                keyss.forEach(function(arg) {
                                    var item = arg.split(' as ');
                                    var path = item.shift();
                                    var key  = item.length ? item : path.split('.'), part;
                                    while (key.length && (part = key[key.length-1].substr(0, 1))) {
                                    if (part == '*' || part == '!') key.pop();
                                    else break;
                                    }
                                    if (key[0] == 'root' && key.shift()) path = key.slice(1).join('.');
                                    if (cont) coll.push(obj.get ? obj.get(path) : obj[path]);
                                        else coll(obj.get ? obj.get(path) : obj[path], key.join('.'));
                                });
                                return cont ? (cont === true ? coll : cont.apply(undefined, coll)) : coll();
                            }
                        }
                    }),
                    (function $_each($_keys, $_values) {
                        return function each(x, f) {
                            var isarr = x instanceof Array;
                            var keyss = isarr ? x.slice(0) : (typeof x == 'object' ? Object.keys(x) : [ x ]), i = 0;
                            while (i < keyss.length) {
                                f(isarr ? keyss[i] : x[keyss[i]], isarr ? i : keyss[i], keyss);
                                i++;
                            }
                        }
                    }),
                    (function(main, wrap, make) {
                        return main(wrap(make));
                    })(
                        (function($fn) {
                            return function func(key) {
                                return key ? $fn(this)(key) : $fn(this);
                            }
                        }),
                        (function($fn) {
                            return function(node) {
                                return function(key) {
                                    return $fn(node, key);
                                }
                            }
                        }),
                        (function(node, key) {
                            var name, path, test;
                            if (key && key.indexOf && key.indexOf('.')>0) {
                                path = key.split('.');
                                name = path.pop();
                                node = node.get(path);
                            }else {
                                name = key;
                            }
                            return node[name] && node[name] instanceof Function
                                && (!node.isStore || node.constructor.prototype[name] instanceof Function)
                                    ? node[name].bind(node) : null;
                        })
                    ),
                    (function(fstchr, delim, wrap) {
                        return function $_toString($_each, $_keys, $_isBaseType) {
                            return wrap(fstchr, delim, $_each, $_keys, $_isBaseType);
                        }
                    })(
                        new RegExp(/[^\s]/),
                        String.fromCharCode(10),
                        (function wrap(fstchr, delim, each, keys, isBaseType) {
                            return function toString(value, recur) {
                                if (!value) {
                                    return '';
                                }else if (value instanceof Function) {
                                    var lines  = value.toString().split(delim);
                                    var last   = lines[lines.length-1];
                                    var indent = last.indexOf('}');
                                    var name   = value.name;
                                    if (value['$$_scope']) each(keys(value['$$_scope']), function(key) {
                                        var text = toString(value['$$_scope'][key]);
                                        if (text) lines.push(name + '.$$_scope.' + key + ' = ' + text);
                                    });
                                    var length = lines.length-1;
                                    return lines.reduce(function(r, v, i, a) {
                                        if (v && typeof v == 'string' && v != '') {
                                            r.lines.push(v.slice(Math.min(v.search(fstchr), r.indent)));
                                        }
                                        return i == length ? r.lines : r;
                                    }, { indent: indent, lines: [] }).join(delim);
                                }else if (recur === false || !value.constructor || isBaseType(value.constructor)) {
                                    return value;
                                }else if (value.constructor && value.constructor.prototype && value.constructor.name != 'Object') {
                                    var lines = [];
                                    var ctor  = value.constructor;
                                    var name  = ctor.name;
                                    lines.push(toString(ctor));
                                    if (ctor.of) lines.push(name + '.of = ' + toString(ctor.of));
                                    if (ctor.pure) lines.push(name + '.pure = ' + toString(ctor.pure));
                                    each(keys(value.constructor.prototype), function(key) {
                                        var text = toString(value[key], false);
                                        if (text) lines.push(name + '.prototype.' + key + ' = ' + text + ';');
                                    });
                                    return lines.length ? lines.join(delim) : null;
                                }
                            }
                        })
                    ),
                // === isEqual === //
                    (function() {
                        function objEqual(a, b) {
                            var p, t;
                            for (p in a) {
                                if (typeof b[p] === 'undefined') {
                                    return false;
                                }
                                if (b[p] && !a[p]) {
                                    return false;
                                }
                                t = typeof a[p];
                                if (t === 'object' && !objEqual(a[p], b[p])) {
                                    return false;
                                }
                                if (t === 'function' && (typeof b[p] === 'undefined' || a[p].toString() !== b[p].toString())) {
                                    return false;
                                }
                                if (a[p] !== b[p]) {
                                    return false;
                                }
                            }
                            for (p in b) {
                                if (typeof a[p] === 'undefined') {
                                    return false;
                                }
                            }
                            return true;
                        };
                        return function isEqual(a, b) {
                            if (a == null || b == null) {
                                return false;
                            }else if (a instanceof Array) {
                                return b instanceof Array && a.length == b.length ? a.reduce(function(r, v, i) {
                                    return r && isEqual(v, b[i]) ? true : false;
                                }, true) : false;
                            }else if (typeof a == 'object') {
                                if (a.uid && b.uid
                                    //&& (!(!a.__ || !b.__ || a.__ != b.__))
                                    && (a.uid instanceof Function ? a.uid() : a.uid) === (b.uid instanceof Function ? b.uid() : b.uid)) {
                                    return true;
                                }else if (a.constructor == Object) {
                                    return typeof b == 'object' && b.constructor == Object ? objEqual(a, b) : false;
                                }else {
                                    return false;
                                }
                            }else {
                                return a === b;
                            }
                        };
                    })()
            ),
        // === Node === //
            (function() {
                return {
                    klass: function Node(opts) {
                        this._id       = this.id();
                        this._cid      = this.extractID(opts);
                        this._cache    = {};
                        this._started  = 2;
                        this.start();

                        if (opts.parent && this.is(opts.parent)) {
                            this._parent = opts.parent;

                            var store = this._parent.get(this._cid);
                            if (store && this.test(store)) {
                                this._store = store;
                                this._store.ref(this);
                            }else {
                                this._store = this._parent._store.add(this._cid, this);
                            }
                            if (this._parent._events && this._parent._events._id != this._events._id) {
                                this._events = this._parent._events;
                            }

                            this._level  = (this._parent._level  || (this._parent._level  = 0)) + 1;
                            this._offset = (this._parent._offset || (this._parent._offset = 0)) + (opts.offset || 0);
                        }else {
                            this._store  = this._store;
                            this._store.ref(this);
                            this._level  = 0;
                            this._offset = opts.offset || 0;
                        }
                    },
                    ext: [
                        (function children() {
                            return this.get(this.ctor.prop('_children')) || this.node(this.ctor.prop('_children'));
                        }),
                        (function extractID(opts) {
                            return (typeof opts == 'string' || opts == 'number') ? opts
                                : (opts.name ? opts.name : (opts._id || opts._cid
                                    || (!(opts.id instanceof Function ? opts.id
                                : (!(opts.cid instanceof Function ? opts.cid : ''))))));
                        }),
                    // === BASE === //
                        (function main() {
                            return this;
                        }),
                        (function store() {
                            return this._store;
                        }),
                        (function of(opts, ctor) {
                            return ctor ? new ctor(opts) : new this.constructor(opts);
                        }),
                        (function is(value) {
                            return value && value instanceof this.__;
                        }),
                        (function uid() {
                            return this._store._uid;
                        }),
                        (function nid() {
                            return ''+this._store._uid;
                        }),
                        (function cid() {
                            return this._cid;
                        }),
                        (function ref(value) {
                            return value && value._ref && value._ref instanceof this.__ ? value._ref : value;
                        }),
                        (function fn() {
                            return this._store.root.get('sys.fn');
                        }),
                        (function lift(f) {
                            return this.maybe(this).lift(f).toIO();
                        }),
                        (function bin(f) {
                            return this._store.root.get('utils.bin')(f);
                        }),
                        (function($args, $get) {
                            return function get() {
                                return this.ref($get(this, $args([].slice.call(arguments))));
                            }
                        })(
                            (function args(x) {
                                return x && x instanceof Array && x.length
                                    ? x.flat().join('.') : undefined;
                            }),
                            (function get(node, key) {
                                if (!key && typeof key == 'undefined') return node._store;
                                else if (key && typeof key == 'string' && (node.has(key))) return node._store.get(key);
                                else if (key && typeof key == 'number') return node._store.at(key);
                                else if (key && key.indexOf && key.indexOf('.') > 0) return node._store.path(key);
                                else if (key && key instanceof Array) return key.length > 1 ? node._store.path(key) : (key.length ? node.get(key.slice(0).shift()) : node);
                                else return key ? undefined : (node._ref || node);
                            })
                        ),
                        (function acc(key, value) {
                            return value ? this.set(key, value) : this.get(key);
                        }),
                        (function remove(key) {
                            return this.has(key)
                                ? (this.emit('change', key, 'remove', this.get(key))
                                    || this.clear(key)) : null;
                        }),
                        (function has(key) {
                            return (this._store.index(key) >= 0);
                        }),
                        (function assert(key, value) {
                            return (this.get(key) == value);
                        }),
                    // === EVENTS === //
                        (function addEventListener(/* instance, name, selector, target */) {
                            return this._events.addEventListener.apply(this._events, [ this ].concat([].slice.call(arguments)));
                        }),
                        (function removeEventListener(info) {
                            return this._events.removeEventListener.call(this._events, info);
                        }),
                        (function getEventListener(lstnr) {
                            return (this._lstnrs || (this._lstnrs = this.node('listeners'))).get(lstnr.hid || lstnr);
                        }),
                        (function setEventListener(lstnr) {
                            return this.getEventListener(lstnr.hid) || this._lstnrs.set(lstnr.hid, lstnr);
                        }),
                        (function observe(/* [ [ instance ], name, selector, handler ] */) {
                            if (!this.dispatcher) this.connect();
                            var args = [].slice.call(arguments);
                            var inst = typeof args[0] != 'string' ? args.shift() : this;
                            var hndl = args.pop();
                            args.push(typeof hndl == 'string' ? inst.func(hndl) : hndl);
                            return this.setEventListener(this.dispatcher.addEventListener.apply(this.dispatcher, [ inst, 'store' ].concat(args)));
                        }),
                        (function once() {
                            var args = [].slice.call(arguments);
                            return this.observe.apply(this, args.slice(0, -1).append({ once: true }, args.pop()));
                        }),
                        (function pipe(source, args) {
                            if (this._started > 1) {
                                this._events.emit(source, args);
                            }else {
                                this.buffer.push([ source, args ]);
                            }
                        }),
                        (function start() {
                            if (!this._started && (++this._started)) {
                                sys().log([ '!START!', this.identifier() ]);
                            }else if (this._started == 1 && ++this._started) {
                                while (this.buffer.length) {
                                    this._events.emit(this.buffer[0][0], this.buffer[0][1]);
                                    this.buffer.shift();
                                }
                            }
                            return (this._started == 2);
                        }),
                        (function emit(name, path, type, value) {
                            if (this.isEvents || (this._parent && this._parent.isEvents)) {
                            }else if (!this._events || !this._events.emit) {
                            }else {
                                var parts = path.split('.'), key = parts.pop();
                                this.pipe(parts.length ? (this.get(parts.join('.')) || this) : this, [ name, key, type, value ]);
                            }
                        }),
                    // === NODE === //
                        (function lookup(key, orElse) {
                            return this.maybe(
                              key ? (this.get(key)||(orElse && orElse instanceof Function ? orElse(this) : orElse)) : orElse
                            );
                        }),
                        (function map(f) {
                            return this._store.map(f);
                        }),
                        (function filter(f) {
                            return this._store.vals().filter(f);
                        }),
                        (function parse() {
                            return this._store.parse.apply(this, arguments);
                        }),
                        (function object(k) {
                            return this._store.object(k);
                        }),
                        (function info(/* recur, opts */) {
                            return this._store.info.apply(this._store, arguments);
                        }),
                        (function level(offset) {
                            return this._level - (offset ? (offset._level || this._offset) : this._offset);
                        }),
                        (function relative(other) {
                            return this.identifier(true).slice(other.level(this));
                        }),
                    // === CHILD ETC === //
                        (function parent(key, value) {
                            return this._parent ? this._parent.acc(key, value) : null;
                        }),
                        (function add(name) {
                            return this.get(name) || this.of({ name: name, parent: this });
                        }),
                        (function child(opts, ctor, parent) {
                            parent || (parent = this);
                            var exists = this.exists(opts, ctor), instance;
                            if (exists && this.is(exists)) return exists;
                            var options  = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            if (ctor && this.ctor.test(ctor)) {
                                instance = this.of(options, ctor);
                            }else {
                                if (ctor) this.store().child(options.name, ctor);
                                instance = this.of(options, this.constructor);
                            }
                            return this.emit('change', instance._cid, 'create', instance) || instance;
                        }),
                        (function exists(options) {
                            var opts = options ? (typeof options == 'string' ? { name: options } : options) : {},
                            id = opts.name = opts.name || opts.id || opts.cid,
                            exists = id ? this.get(id) : false;
                            if (exists && this.is(exists)) return exists;
                            return false;
                        }),
                        (function instance(opts, ctor, parent) {
                            ctor || (ctor = this.constructor);
                            var options = typeof opts == 'object' ? opts : { name: opts, parent: parent };
                            options.parent || (options.parent = this);
                            return new ctor(options);
                        }),
                        (function node(opts) {
                            return this.child(opts, this.__);
                        }),
                    // === VALUES ETC === //
                        (function values(recur) {
                            return this._store.values(recur);
                        }),
                        (function clear(id) {
                            return id
                            ? (this.has(id) ? (this.emit('change', id, 'remove', this.get(id)) || this._store.clear(id)) : null)
                            : (this.parent().emit('change', this.cid(), 'remove', this) || this._store.clear());
                        }),
                        (function keys(index) {
                            return this._store.keys(index);
                        }),
                        (function vals() {
                            return this._store.vals();
                        }),
                        (function length() {
                            return this._store.length();
                        }),
                        (function select() {
                            return this._store.select.apply(this._store, arguments);
                        }),
                        (function ensure(path, ctor) {
                            var node = this, next = node, item, index = 0,
                            parts = path instanceof Array ? path.slice(0) : path.split('.');
                            while(index < parts.length && (item = parts[index++])) {
                                if (false && item == node._cid) continue;
                                else if (!(next = node.get(item)))
                                next = ((ctor && ctor === true) || (!ctor && node._children)) ? node.node(item) : node.child(item, ctor);
                                node = next;
                            }
                            return node;
                        }),
                    // === FIND ETC === //
                        (function equals(value) {
                            if (!value) return false;
                            else if (typeof value == 'string') {
                                if (value.isLowerCase()) return this.cid() === value;
                                else if (value.replace(/[^0-9]/g, '') == value) return this.uid() === parseInt(value); 
                                else return this.cid() === value;
                            }
                            return this.is(value) && this.uid() === value.uid() ? true : false;
                        }),
                        (function closest(key) {
                            var node = this;
                            var type = this.ctor.root().is(key);
                            while (node) {
                                if (type && key.is(node)) break;
                                else if (type) node = node.parent();
                                else if (key instanceof Function && key(node)) break;
                                else if (node.equals(key)) break;
                                else node = node.parent();
                            }
                            return node;
                        }),
                        (function link() {
                            return this.store().link.apply(this.store(), [].slice.call(arguments));
                        }),
                        (function haslink() {
                            return this.store().haslink.apply(this.store(), [].slice.call(arguments));
                        }),
                        (function find(value, cached) {
                            return this.store().find(value, cached);
                        }),
                        (function pertains(value) {
                            if (!value) {
                                return false;
                            }else if (this.is(value)) {
                                return this.equals(value.closest(this));
                            }else if (value) {
                                return this.pertains(this.ref(this.find(value)));
                            }else {
                                return false;
                            }
                        }),
                        (function walk(run) {
                            return function walk(key, callback) {
                                var parts = typeof key == 'string' ? key.split('.') : key.slice(0);
                                return run(parts, callback)(this.store());
                            }
                        })(
                            (function walk(parts, callback) {
                                return function next(node) {
                                    var key = parts.shift();
                                    var val = node.get(key);
                                    if (val) {
                                        if (callback(val, key, node)) {
                                            return val;
                                        }else {
                                            return val && node.is(val) && parts.length ? next(val) : null;
                                        }
                                    };
                                }
                            })
                        ),
                        (function combine(f, a) {
                            return sys.get('async.combine')(this.store(), f, a);
                        })
                    ],
                    attrs: [
                        (function of(opts) {
                            opts || (opts = {});
                            if (typeof opts == 'string') {
                                return new this({ name: opts });
                            }else {
                                return new this(opts);
                            }
                        }),
                        (function childOf(parent) {
                            return typeof parent == 'string' ? sys().lookup(parent) : sys().of(parent).map(function(p) {
                                return Function.prototype.apply.bind(p.child, p);
                            }).lift(function(make, args) {
                                return make(args);
                            });
                        })
                    ],
                    makeSet: function(isEqual) {
                        return function set(key, value, path) {
                            return key && path !== false && key.indexOf && key.indexOf('.') > 0
                            ? (this._store.path(key) ? (isEqual(this._store.path(key), value) ? value
                                : (this.emit('change', key, 'update', value) || this._store.path(key, value)))
                                    : (this.emit('change', key, 'create', value) || this._store.path(key, value)))
                            : (this.has(key) ? (isEqual(this._store.get(key), value) ? value
                                : (this.emit('change', key, 'update', value) || this._store.set(key, value)))
                            : (this.emit('change', key, 'create', value) || this._store.set(key, value)));
                        };
                    },
                    init: function(type, klass, sys) {
                        var store = klass.prop('_store', sys.root), utils = store.get('utils');
                        klass.prop('identifier', utils.get('identifier')('_parent'));
                        klass.prop('test', store.is.bind(store));
                        klass.prop('isStore', true);
                        klass.prop('set', type.makeSet(utils.get('isEqual')));
                        klass.prop('func', klass.fn = utils.get('func'));
                        klass.prop('konst', utils.get('$const'));
                        klass.prop('bin', utils.get('pass')(utils.get('bind')));
                        klass.prop('path', klass.find('$store').prop('path', utils.get('path')));

                        var root = sys.root = klass.of('root');
                        var ctor = sys.ctor = this;
                        //var ext  = root.child('ext');
                        store.map(function $fn(v,k,i,o) {
                            o.ref().child({ name: k });
                        });
                        klass.prop('buffer', []);
                        sys.get = utils.get('get')(root);
                    }
                };
            }),
        // === Functor === //
            (function Functor() {
                return {
                    klass: function Functor() {
                        this.id = this.id();
                        this.$$init.apply(this, arguments);
                    },
                    ext: [
                        (function $$init(mv) {
                            this._x = mv;
                        }),
                        (function is(value) {
                            return value ? (value instanceof this.constructor || value.__ === this.__) : false;
                        }),
                        (function of() {
                            return this.constructor.of.apply(this.constructor, [].slice.call(arguments));
                        }),
                        (function attr(name, value) {
                            this[name] = value;
                            return this;
                        }),
                        (function map(f) {
                            return new this.constructor(this._x.map ? this._x.map(f) : f.call(this, this._x));
                        }),
                        (function join() {
                            return this._x || this.mf || this._x || this._f || this._x;
                        }),
                        (function lift(f) {
                            return this.map(function(v1) {
                                return function(v2) {
                                    return f(v1, v2);
                                }
                            });
                        }),
                        (function chain(f) {
                            return this.map(f).join();
                        }),
                        (function run(f) {
                            return this.chain(f || unit);
                        })
                    ],
                    attrs: [
                        (function of(x) {
                            return new this(x);
                        }),
                        (function pure(x) {
                            return new this(x);
                        })
                    ]
                };
            }),
        // === Compose === //
            (function Compose(klass, ext, attrs) {
                return function MakeCompose() {
                    return { klass: klass, ext: ext, attrs: attrs };
                }
            })(
                (function Compose() {
                    this.$super.apply(this, arguments);
                }),
                (function() {
                    return [].slice.call(arguments);
                })(
                    (function MakeCompose(make, just, next) {
                        return make(just, next);
                    })(
                        (function make(just, next) { 
                            return function $fn(f) {
                                return function $_compose(g) {
                                    return g ? (g.name == 'unit' ? just(f) : (f.name == 'unit' ? just(g) : next(f, g))) : just(f);
                                };
                            };
                        }),
                        (function just(f) {
                            return function $_just(a) {
                                return f(a);
                            }
                        }),
                        (function next(f, g) {
                            return function $_next(a) {
                                return g(f(a));
                            };
                        })
                    ),
                    (function $$init(x) {
                        this._x = this.$$cmps(x);
                    }),
                    (function $$cmps(x) {
                        return !x && typeof x == 'undefined' ? unit : (x instanceof Function && x.length > 1 ? this.fn.curry(x) : x);
                    }),
                    (function ap(monad) {
                        return monad.map ? monad.map(this.$fn(this._x)(unit)) : this.ap(this.of(monad));
                    }),
                    (function apply(monad) {
                        return monad.ap(this);
                    }),
                    (function map(f) {
                        return new this.constructor(this.$fn(this._x)(f));
                    }),
                    (function bimap(f, g) {
                        return new this.constructor(this.$fn(this._x)(f)(g));
                    }),
                    (function run(v) {
                        return this.chain(unit)(v);
                    })
                ),
                (function() {
                    return [].slice.call(arguments);
                })(
                    (function of(x) {
                        return new this(x);
                    })
                )
            ),
        // === Cont === //
            (function() {
                return {
                    klass: (function Cont(mv, mf) {
                        this.$super.call(this, mv, mf);
                    }),
                    ext: [
                        (function $$init(x, f) {
                            if (x) this.mv = this.$cast(x);
                            if (f) this.mf = f;
                        }),
                        (function mf(t) {
                            return function $_pure(f) {
                                return f(t);
                            }
                        }),
                        (function $count(curr, next, type) {
                            next[type] = curr[type]+'$';
                            next['$$path'] = type+'<<'+curr.id+curr['$$path'];
                            return next;
                        }),
                        (function $cast(v, p) {
                            if (v && this.is(v) && v.cont) {
                                return v.$cont ? v.$cont() : v.cont();
                            }else {
                                return v && v instanceof Function
                                    && (p || v.name.substr(-4) == 'cont'
                                          || v.name.substr(-4) == 'pure'
                                          || v.name == 'mf') ? v : this.constructor.val(v);
                            }
                        }),
                        (function $pure(f) {
                            return this.mf.name == this.constructor.prototype.mf.name ? f : this.$fn(this.mf)(f);
                        }),
                        (function $map(f) {
                            return function(v) {
                              return v instanceof Function 
                                && v.name.substr(-4) == 'pure'
                                  && (!f.name || f.name.substr(-4) != 'pure' || f.name != 'mf') ? v(f) : f(v);
                            }
                        }),
                        (function map(f) {
                            return this.$count(this, new this.constructor(this.mv, this.$fn(this.$pure(this.$map(f)))(this.$cast)), '$$map');
                        }),
                        (function $bind(mv, mf) {
                            return this.$count(this, new this.constructor(mv, this.$fn(mf)(this.$cast)), '$$bind');
                        }),
                        (function bind(f) {
                            return this.$bind(this.$cont(), f);
                        }),
                        (function chain(k) {
                            return this.$cont()(k || unit);
                        }),
                        (function fmap() {
                            return this.bind(this.of.bind(this));
                        }),
                        (function ap(other) {
                            return this.bind(function(result) {
                                return other.is(result) ? result.ap(other) : other.chain(result);
                            });
                        }),
                        (function apply(other) {
                            return other.ap(this);
                        }),
                        (function lift(m) {
                            return this.bind(function(result) {
                                return m.run(result);
                            });
                        }),
                        (function pure() {
                            return this.$cont();
                        }),
                        (function run(k) {
                            this['$$run']+='$';
                            return this.chain(k || unit);
                        }),
                        (function once(k) {
                            if (this['$$run']=='') return this.run(k);
                        })
                    ],
                    attrs: (function(cont, val, of, pure) {
                        return [
                            of,
                            cont,
                            (function fromCallback(cb, mf) {
                                return this.of(mf ? cont(cb, mf) : val(cb));
                            }),
                            val,
                            pure
                        ];
                    })(
                        (function cont(mv, mf) {
                            return function $_pure(continuation) {
                                return mv(function(value) {
                                    return mf(value)(continuation);
                                });
                            }
                        }),
                        (function val(v) {
                            return function $_pure(continuation) {
                                return continuation(v);
                            }
                        }),
                        (function of(x, f) {
                            return x instanceof this ? x : new this(x, f);
                        }),
                        (function pure(x, f) {
                            return this.of(x, f);
                        })
                    ),
                    cont: (function $_cont() {
                        return this._locked ? this.$value() : this.$cont();
                    }),
                    resolve: function(ctor) {
                        return function(f) {
                            return this.bind(function $res(r) {
                                return ctor.is(r) ? r.bind($res).cont() : function $_pure(k) {
                                    k(f(r));
                                }
                            });
                        }
                    },
                    $cont: function(ctor) {
                        return function() {
                            return this.next(ctor.cont(this.mv, this.mf));
                        }
                    },
                    is: function(ctor) {
                        return function(value) {
                            return value && value instanceof ctor ? true : false;
                        }
                    },
                    init: function(type, klass, sys) {
                        var proto     = klass.proto(), ctor = klass.$ctor;
                        proto.$$map   = '';
                        proto.$$bind  = '';
                        proto.$$path  = '';
                        proto.$$run   = '';
                        proto.$cast   = proto.$cast.bind(proto);
                        proto.cont    = type.cont;
                        proto.next    = unit;//this.get('root.process.nextTick.next');
                        proto.$cont   = type.$cont(ctor);
                        proto.is      = ctor.is = type.is(ctor);
                        proto.resolve = type.resolve(ctor);
                    }
                };
            }),
        // === Reader === //
            (function() {
                return {
                    klass: function Reader(f) {
                        this.$super.call(this, f);
                    },
                    ext: [
                        (function $$init(f) {
                            this._f = f;
                        }),
                        (function $$meta(curr, next, type, value) {
                            //curr.$context.parse({ curr: curr, next: next, type: type, value: value });
                            return next;
                        }),
                        (function of(f) {
                            return this.$$meta(this, new this.constructor(f || unit), 'of');
                        }),
                        (function ask() {
                            return this.of(unit);
                        }),
                        (function asks(fn) {
                            return this.of(fn);
                        }),
                        (function unit(ctx) {
                            return this.of(this.sys().fn.$const(ctx));
                        }),
                        (function store(key, value) {
                            return typeof value == 'undefined' ? (!key ? this.$store : this.$store.get(key)) : (this.$store.set(key, value));
                        }),
                        (function get(key) {
                            return this.$store.get(key);
                        }),
                        (function map(f) {
                            return this.of(this.$fn(this._f)(f.bind(this)));
                        }),
                        (function bind() {
                            return this.of(Function.prototype.call.bind(function(k, r) {
                                return k.call(this, this.run(r)).run(r);
                            }, this, [].slice.call(arguments).shift()));
                        }),
                        (function klass() {
                            return this.ctor.find.apply(this.ctor, [].slice.call(arguments));
                        }),
                        (function find(value, cached) {
                            return this.$store.find(value, cached);
                        }),
                        (function lift(f) {
                            return this.map(function(v1) {
                                return this.of(function(v2) {
                                    return f.call(this, v1, v2);
                                });
                            });
                        }),
                        (function location() {
                            return this.lift(function(store, loc) {
                                return store.get(loc);
                            }).run(this.$store);
                        }),
                        (function save() {
                            var args = [].slice.call(arguments).flat().join('.').split('.');
                            var name = args.pop();
                            var node = this.find(this.$saved).ensure(args);
                            return node.set(name, this);
                        }),
                        (function load() {
                            var args = [].slice.call(arguments).flat().join('.');
                            return args.length ? this.find(this.$saved).get(args) : this.find(this.$saved);
                        }),
                        (function pure() {
                            return (this._pure || (this._pure = this.$pure(this)));
                        }),
                        (function run(ctx) {
                            return this._f(ctx);
                        })
                    ],
                    attrs: [
                        (function of(f) {
                            return new this(f || unit);
                        }),
                        (function pure(x) {
                            return x instanceof Function ? new this(x) : this.$pure(x);
                        }),
                        (function fromStore(store) {
                            var name = store.cid().toCamel().concat('R');
                            var extR = this.ctor.extend(name, { $store: store });
                            return extR.of(unit);
                        })
                    ],
                    init: function(type, klass, sys) {
                        klass.$ctor.$pure = type.$pure;
                        klass.prop('$store', klass.get('root'));
                        klass.prop('$pure',  klass.get('root.sys.$fn.pure'));
                        klass.prop('$saved', klass.$store.node('$$saved').uid());
                    }
                };
            })
    ),

    (function MakeAsync() {

        return [].slice.call(arguments);
    })(
        // === IMPORT / PARSE === //
            (function $$ASYNC() {
                var items   = [].slice.call(arguments);
                var utils   = this.store('utils');
                var $async  = this.store().child('async');

                return utils.get('importFuncs')(items, $async);
            }),
            (function pure(t) {
                return function $_pure(f) {
                    return f(t);
                }
            }),
            (function cast(t) {
                return t && t instanceof Function && t.name.substr(-4) == 'pure' ? t : function $_pure(f) {
                    return f(t);
                }
            }),
            (function inject(f) {
                return function $_pure(succ, fail) {
                    succ(f());
                };
            }),
            (function eject(x, f) {
                return function $_pure(succ, fail) {
                    x(function(result) {
                        succ(f(result));
                    }, fail);
                };
            }),
            (function count(cnt, block) {
                return function $_pure(succ, fail) {
                    var i = 0;
                    (function f(v) {
                        i++ < cnt ? block(i)(f, fail) : succ(v);
                    })(undefined);
                };
            }),
            (function $_times($_count) {
                return function times(cnt, block) {
                    return $_count(cnt, function() {
                        return block;
                    });
                };
            }),
            (function delay(x, ms) {
                return function $_pure(k) {
                    x(function(v) {
                        ms ? self.setTimeout(function() {
                            k(v);
                        }, ms) : k(v);
                    });
                };
            }),
        // ===== AsyncAP ===== //
            (function ap(f, x) {
                return function $_pure(succ, fail) {
                    var _f;
                    var _x;
                    var count = 0;
                    function fin() {
                        if (++count === 2)
                            succ(_f(_x));
                    }
                    f(function (g) {
                        _f = g;
                        fin();
                    }, fail);
                    x(function $_pure(r) {
                        _x = r;
                        fin();
                    }, fail);
                };
            }),
            (function get(f) {
                return function(r) {
                    return f(r && r instanceof Array && r.length == 1 ? r.first() : r);
                }
            }),
        // ===== AsyncFMAP ===== //
            (function $_fmap($_ap, $_pure) {
                return function fmap(xs, f) {
                    return $_ap($_pure(f), xs);
                };
            }),
        // === FlatMap Bind Array == //
            (function flatmap() {
                return [].slice.call(arguments).apply();
            })(
                (function make($_flat) {
                    return function flatmap(k, f) {
                        return $_flat(k, f || unit);
                    };
                }),
                (function() {
                    function flat(x, f) {
                        return Array.prototype.concat.apply([], x.map(f));
                    };
                    function bind(f) {
                        function bound(x) {
                            return x instanceof Array ? flat(x, bound) : f(x);
                        };
                        return bound;
                    };
                    return function(k, f) {
                        return function(v) {
                            return k(flat(v instanceof Array ? v : [ v ], bind(f)));
                        }
                    };
                })()
            ),
            (function $combine(make) {
                function combine(x, f, a) {
                    return x.bind(make(function(v, t, i, j) {
                        return f(v, t, i, j);
                    }, a, x.length));
                };
                combine['$$_scope'] = { make: make };
                return combine;
            })(
                (function makeCombi(f, a, l) {
                    var i = -1;
                    return function(v) {
                        var j = 0;
                        if (i == l) i = 0;
                        return a.map(function(x) {
                            return f(v, x, !j ? ++i : i, j++);
                        });
                    }
                })
            ),
            (function select() {
                return [].slice.call(arguments).apply();
            })(
                (function make($_const, $_filtered, $_select) {
                    function select(f, m) {
                        return this.chain($_select($_filtered(f || $_const, m || unit)));
                    };
                    select['$$_scope'] = { '$_filtered': $_filtered, '$_select': $_select };
                    return select;
                }),
                (function konst() {
                    return true;
                }),
                (function(f, m) {
                    function $map(v) {
                        return Array.prototype.concat.apply([], (v instanceof Array ? v : [ v ]).map(function(x) {
                            return (x instanceof Array ? $map(x) : [ x ]).filter(f);
                        }));
                    };
                    function $wrap(x) {
                        var o = x.aid();
                        o.arr = false;
                        return x.collect(o, function(x) {
                            return x.map(function(v) {
                                return v instanceof Array ? $wrap(v.map(m)) : v;
                            }).collect(o, $map);
                        });
                    };
                    function $run(x) {
                        return $wrap(x.map(m));
                    };
                    return $run;
                }),
                (function(f) {
                    return function $_select(x) {
                        if (x instanceof Array) {
                            return x.map($_select).chain(f);
                        }else {
                            return x;
                        }
                    };
                })
            ),
            (function array(xs) {
                return function $_pure(succ, fail) {
                    var values = new Array(xs.length);
                    var count  = 0;
                    xs.forEach(function(x, i) {
                        x(function(result) {
                            values[i] = result;
                            count++;
                            if (count == xs.length) {
                                succ(values);
                            }
                        }, fail);
                    });
                };
            }),
            (function $_collect($_array) {
                return function() {
                    return $_array([].slice.call(arguments));
                }
            }),
        // === XHR === //
            (function newxhr() {
                var _xhr = false;
                if (this.XMLHttpRequest) { // Mozilla, Safari, ...
                    _xhr = new XMLHttpRequest();
                }else if ( this.ActiveXObject ) { // IE
                    try {
                        _xhr = new ActiveXObject("Msxml2.XMLHTTP");
                    }catch (e) {
                        try {
                            _xhr = new ActiveXObject("Microsoft.XMLHTTP");
                        }catch (e) {}
                    }
                }
                return _xhr;
            }),
            (function(wrap, parser, loader) {
                return function $_script($_pure) {
                    return wrap(loader, parser, $_pure);
                }
            })(
                (function(loader, parser, pure) {
                    return function script(url, key) {
                        return loader(pure(parser(url, key)));
                    }
                }),
                (function(url, ref) {
                    if (typeof url == 'string') {
                        if (url.substr(-3, 3) != '.js') url = { url: url };
                    }else if (typeof url == 'object') {
                    }
                    if (ref) {
                        url.ref = ref;
                    }
                    if (url.url && url.url.slice(-3) != '.js') url.url += '.js';
                    url.url = url.url.replace(/\$/g, '');
                    return url;
                }),
                (function(url) {
                    return function $_pure(succ, fail) {
                        url(function (info) {
                            var head = document.getElementsByTagName('head')[0];
                            var url  = info.url;
                            var ref  = info.ref;
                            var ext  = url.split('.').slice(-1).shift(), script;
                            if (ref && (script = head.querySelector('[src="' + url + '"]'))) {
                                if (script.getAttribute('data-state') == 'done') {
                                    succ(script);
                                }else {
                                    script.addEventListener('load', function () {
                                        succ(this);
                                    });
                                }
                            }else {
                                if (ext == 'css') {
                                    script = document.createElement("link");
                                    script.type = 'text/css';
                                    script.rel  = 'stylesheet';
                                    script.href = url;
                                }else {
                                    script = document.createElement("script");
                                    if (ext == 'tmpl') {
                                        script.type = 'text/template';
                                    }
                                    script.src = url;
                                    script.setAttribute('data-state', 'init');
                                }
                                if (ref) {
                                    script.setAttribute('data-ref', ref);
                                }
                                script.addEventListener('load', function () {
                                    this.setAttribute('data-state', 'done');
                                    succ(this);
                                });
                                script.addEventListener("error", function() {
                                    this.setAttribute('data-state', 'fail');
                                    fail(this);
                                });
                                script.setAttribute('data-state', 'load');
                                head.appendChild(script);
                            }
                        }, fail);
                    };
                })
            ),
            (function $_request($_newxhr, $_pure) {
                return function request(url, options) {
                    var request;
                    if (typeof (url) === "object") request = $_pure(url);
                    else if (typeof (url) === "string") request = $_pure({ 'url' : url, 'cached' : (options === true) });
                    else request = url;
                    return function (succ, fail) {
                        request(function (_request) {
                            var xhr = $_newxhr(), type = _request.type || 'GET';
                            xhr.onload = function () {
                                succ(xhr.responseText);
                            };
                            xhr.onerror = function (e) {
                                e.preventDefault();
                                fail('masync.' + type + ': ' + e.toString());
                            };

                            var url = _request.url;
                            if (url.slice(0, 4) != 'http') {
                                url = self.location.origin+self.location.pathname.replace('core/worker.js', '')+url;
                            }
                            xhr.open(type, url);
                            xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
                            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

                            if (type == 'POST') {
                                xhr.setRequestHeader('Content-Type', _request.contentType || 'application/json');
                            }
                            if (_request.auth) {
                                xhr.setRequestHeader('Authorization', _request.auth);
                            }
                            if (_request.accept) {
                                xhr.setRequestHeader('Accept', _request.accept);
                            }else {
                                xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
                            }
                            if (!_request.cached) {
                                xhr.setRequestHeader('Pragma', 'no-cache');
                                xhr.setRequestHeader('Cache-Control', 'no-cache');
                                xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
                            }
                            if (_request.type == 'GET' || !_request.data) return xhr.send();
                            else return xhr.send(_request.data);
                        }, fail);
                    };
                }
            })
    ),

    (function MakeApp() {
 
        return [].slice.call(arguments);
    })(
        (function $$APP(enq, run) {
            var sys = this.get('sys');
            if (sys.isWorker) return;
            return run.call(enq(sys), sys.get('async.script'), this.store().ensure('script.core').store());
        }),
        (function(sys) {
            function enqueue(deps, run) {
                return sys.klass('Cont').of([ deps, run ], function(d) {
                    return function $_pure(k) {
                        sys.enqueue(d.shift(), d.pop(), true).run(k);
                    }
                }).attr('name', deps.name);
            };
            sys.enqueue = enqueue;
            return sys;
        }),
        (function(script, store) {
            this.get('async.collect')(
                script({ url: 'core/app.js',     ref: store.child('app').uid() }),
                script({ url: 'core/router.js',  ref: store.child('router').uid() }),
                script({ url: 'core/worker.js',  ref: store.child('worker').uid() }),
                script({ url: 'core/effect.js',  ref: store.child('effect').uid() }),
                script({ url: 'core/config.js',  ref: store.child('config').uid() }),
                script({ url: 'core/storage.js', ref: store.child('storage').uid() })
            )(function() {
                store.get('app.cont').run();
            });
        })
    )

);
