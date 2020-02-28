var data = [
  { id: 1, firstname: 'Erik', lastname: 'Schoel', job: 'Full Stack Developer' },
  { id: 2, firstname: 'Matthijs', lastname: 'Openneer', job: 'Full Stack Developer' },
  { id: 3, firstname: 'Erik', lastname: 'Runderkamp', job: 'Front-End Developer' }
];
data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));
// data.push.apply(data, data.slice(0).map(d => Object.assign({}, d)));

var arr = data.map((v, i) => i).combine(function(x, y, a, b) {
  console.log([ 'Iteration 1:', x, y, a, b ]);
  return y;
});

var test = arr.load(['id', 'description', 'price']).chain(function(result) {
  return [100,200,300,400].combine(function(x, y, a, b) {
    console.log([ 'Iteration 2:', x, y, a, b ]);
    return [ x, y ];
  }).load(result);
});

var chainEach = arr.load(Object.keys(data[0])).chain(function(result) {
    console.log([ 'Combine done:', result ]);
    return result.each(function(x) {
      console.log([ 'Each:', x ]);
      return x;
    });
});

var justEach = arr.load(Object.keys(data[0])).each(function(x) {
  console.log([ 'Each:', x ]);
  return x;
});

function makeElementTags(tagName) {
  return [ ['<', tagName, '>'], ['<', tagName, '/>'] ].map(tag => tag.join(''));//.map((tag, idx) => idx%2===0 ? tag : [ tag ]);
}

function createElementFromHTML(htmlString, tagName) {
  var div = document.createElement(tagName || 'div');
  div.innerHTML = htmlString.trim();
  return div.firstChild; 
}

function makeElementInfo(leafElementName, wrapperElementName, containerElementName, attributeMap) {
  return function(dataArray) {
    return dataArray.load(makeElementTags(leafElementName)).each(function(markupData, dataIndex) {
      return markupData.filter((v, i) => i%2===0).reduce(function(acc, item) {
        var elm = acc.appendChild(createElementFromHTML(item.open.replace('>', ' data-key="' + item.key + '">') + item.value + item.close, acc.localName));
        if (attributeMap[item.key]) {
          acc.setAttribute(attributeMap[item.key], item.value);
        }
        return acc;
      }, document.createElement(wrapperElementName));
    }).chain(function(items) {
      return items instanceof Array ? items : [ items ];
    }).chain(function(items) {
      var container = document.createElement(containerElementName);
      items.forEach(item => container.appendChild(item));
      return container;
    });
  }
}

function defaultCombineFunc(data) {
  return function(x, y, l, p) {
    return p.pos && p.pos[0] && p.pos[0] === 0 && p.pos.length === 1 ? [ data[x], { key: y, value: data[x][y] } ] : { key: y, value: data[x][y] };
  }
}

function defaultReaderFunc(data) {
  return data && data.length ? Object.keys(data[0]) : [];
}

function _makeDataArray(dataCombineFunc, dataReaderFunc) {
  return function(dataArrayOfObjects) {
    return dataArrayOfObjects.map((v, i) => i).combine(dataCombineFunc(dataArrayOfObjects)).load(dataReaderFunc(data));
  }
}

function makeDataArray(dataCombineFunc, dataReaderFunc) {
  return _makeDataArray(dataCombineFunc || defaultCombineFunc, dataReaderFunc || defaultReaderFunc);
}

function prepareParentElement(selector, wrapperElementName) {
  var parent = document.querySelector(selector);
  return wrapperElementName ? (parent.querySelector(wrapperElementName) || parent.appendChild(document.createElement(wrapperElementName))) : parent;
}

function renderFromElements(dataArrayFunc, elementFunc) {
  return function(dataArrayOfObjects, targetElement) {
    return dataArrayFunc(dataArrayOfObjects).combine(function(x, y, a, b, c) {
      return Object.assign(x, c%2===0 ? { open: y } : { close: y });
    }).take(elementFunc).chain(function(result) {
      return result.map((container) => {
        var child, counterTarget = 0, containerCounter = 0, current, containerTarget = targetElement.querySelector(container.localName);
        if (containerTarget) {
          while (container.firstChild && (child = container.children[containerCounter++])) {
            if ((current = containerTarget.children[counterTarget++]) && current.getAttribute('data-id') === child.getAttribute('data-id')) {
              if (current.innerHTML !== child.innerHTML) {
                current.innerHTML = child.innerHTML;
              }
            }else if (containerTarget) {
              targetElement.replaceChild(container, containerTarget);
              break;
            }else {
              targetElement.appendChild(container);
              break;
            }
          }
          var containerLength = container.children.length;
          while (containerTarget.children.length > containerLength) containerTarget.removeChild(containerTarget.children[containerLength]);
        }else {
          targetElement.appendChild(container);
        }
        return targetElement;
      });
    });
  }
};

function cacheSetup(base, wrapperElementName) {
  return function(parentElementSelector) {
    return function(dataArrayOfObjects) {
      return base(dataArrayOfObjects, prepareParentElement(parentElementSelector, wrapperElementName));
    }
  }
};

function renderGeneric(dataCombineFunc, dataReaderFunc, leafElementName, groupElementName, containerElementName, wrapperElementName, attributeMap) {
  return cacheSetup(
    renderFromElements(
      makeDataArray(dataCombineFunc, dataReaderFunc),
      makeElementInfo(leafElementName, groupElementName, containerElementName, attributeMap || {})
    ), 'table');
};

function renderTableHead(dataCombineFunc, dataReaderFunc) {
  return renderGeneric(dataCombineFunc, dataReaderFunc, 'th', 'tr', 'thead', 'table', { id: 'data-id' });
};

function renderTableBody(dataCombineFunc, dataReaderFunc) {
  return renderGeneric(dataCombineFunc, dataReaderFunc, 'td', 'tr', 'tbody', 'table', { id: 'data-id' });
};

function renderNav(dataCombineFunc, dataReaderFunc) {
  return renderGeneric(dataCombineFunc, dataReaderFunc, 'a', 'li', 'ul', 'nav');
};

function renderFromHTML(data) {
    var tab = data.map((v, i) => i).combine(fn(data));
    return tab.load(Object.keys(data[0])).combine(function(x, y, a, b) {
      // console.log([ 'Combine 2:', x, y, a, b ]);
      return b%2===0 ? (y + x) : y;
    }).load(['<td>','</td>']).each(function(row) {
      // console.log([ 'row', row ]);
      return row.join('');
    }).combine(function(x, y, a, b) {
      return b%2===0 ? (y + x) : y;
    }).load(['<tr>', '</tr>']).chain(function(rows) {
      rows.unshift('<table>');
      rows.push('</table>');
      return rows.flat();
    }).chain(table => table.join('\n')).chain(function(table) {
      document.querySelector('.empty-main').innerHTML = table;
      return table;
    });
}

function runTable(tableEngine) {
  return function(data, func) {
    return tableEngine(data).run(func === true ? console.log.bind(console) : (func instanceof Function ? func : undefined));
  }
}

function runFromElements() {
  var start = now();
  renderFromElements(data.map((row, idx) => (row.id = idx + 1) && row)).run(function(x) {
    var end = now();
    console.log([ x.rows.length, end, end - start]);
  }, { obj: false });
}

function runFromHTML() {
  var start = now();
  renderFromHTML(data.map((row, idx) => (row.id = idx + 1) && row)).run(function(x) {
    var end = now();
    console.log([ x.length, end, end - start]);
  }, { obj: false });
}