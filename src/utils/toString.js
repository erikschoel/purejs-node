'use strict';

var toString = (function(fstchr, delim, wrap) {
  return wrap(fstchr, delim);
})(
  new RegExp(/[^\s]/),
  String.fromCharCode(10),
  (function wrap(fstchr, delim) {
    return function toString(value, recur) {
      if (!value) {
        return '';
      }else if (value instanceof Function) {
        var lines  = value.toString().split(delim);
        var last   = lines[lines.length-1];
        var indent = last.indexOf('}');
        var name   = value.name;
        if (value['$$_scope']) Object.keys(value['$$_scope']).forEach(function(key) {
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
      }else if (recur === false || !value.constructor) {
        return value;
      }else if (value.constructor && value.constructor.prototype && value.constructor.name != 'Object') {
        var lines = [];
        var ctor  = value.constructor;
        var name  = ctor.name;
        lines.push(toString(ctor) + ';');
        if (ctor.of) lines.push(name + '.of = ' + toString(ctor.of) + ';');
        if (ctor.pure) lines.push(name + '.pure = ' + toString(ctor.pure) + ';');
        Object.keys(value.constructor.prototype).filter(key => key !== 'constructor')
        // .sort(function(key1, key2) {
        //   return key1 === 'constructor' ? -1 : (key2 === 'constructor' ? 1 : 0);
        // })
        .forEach(function(key) {
          var text = toString(value[key], false);
          if (text) {
            if (typeof text == 'string' && !text.match(/\s/) && !text.match(/.*'.*/) && !text.match(/^'.*'$/)) {
              text = text.quote();
            }
            lines.push(name + '.prototype.' + key + ' = ' + text + ';');
          }
        });
        return lines.length ? lines.join(delim) : null;
      }
    }
  })
);

module.exports = toString;

module.exports.default = toString;
