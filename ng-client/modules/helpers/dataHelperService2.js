presuApp.factory('dataHelperService', function($http, $rootScope) {

  var dataHelperService = {};

  var defaultConceptos = [

    { name: 'anterior', field: 'Devengado Anterior', title: 'Ejecutado 2014', isBase: false, clazz: 'progress-bar-danger',
      description: 'El total de crédito ejecutado correspondiente al ejercicio anterior.' },

    { name: 'presupuestado', field: 'Presupuestado', title: 'Presupuestado 2015', isBase: true, clazz: 'progress-bar-success',
      description: 'El total de crédito presupuestado para todo el año vigente a la fecha.' },

    { name: 'comprometido', field: 'Comprometido', title: 'Comprometido 2015', isBase: false, clazz: 'progress-bar-info',
      description: 'El compromiso es la obligación potencial que el Estado contrae con un tercero, empresa o individuo, para adquirir un bien o servicio, transferir fondos o contratar personal. Es un gasto potencial similar a lo que significa una reserva. Se materializa generalmente a través de una Orden de Compra.' },

    { name: 'devengado', field: 'Devengado', title: 'Ejecutado 2015', isBase: false, clazz: 'progress-bar-warning',
      description: 'El ejecutado es la obligación de pago que surge cuando se reciben los bienes o servicios pactados en la Orden de Compra o cuando se ordena liquidar haberes o jubilaciones. El proveedor entrega los bienes junto con su factura, el Estado los recibe y a partir de ahí se genera la obligación de pago (Orden de Pago) que se registra como devengado. El concepto de gasto devengado es independiente de la efectiva realización del pago.' },

    // { name: 'pagado', field: 'Pagado', title: 'Pagado', isBase: false, clazz: 'progress-bar-danger',
      // description: 'El pagado es el momento en el cual se liberan los fondos para cancelar la factura por los bienes y servicios recibidos o se pagan sueldos o jubilaciones.' }

  ];

  dataHelperService.promiseData = function(params) {

  };

  /*
  * Recibe la información del archivo csv
  * y carga toda la información procesada en data
  *
  * dataHelperService.loadData(...) = {
  *   dimensiones: ['Finalidad', 'Cod. y Desc. Funcion'],
  *   conceptos: {presupuestado: 'Presupuestado', comprometido: 'Comprometido', ... },
  *   concepto: 'devengado',   // the key in the conceptos object, not the value
  *   mes: 7,
  *   dataraw: [...], // un elemento por cada fila del archivo csv filtrado por mes
  *   dataready: [...], // un elemento por cada fila y concepto
  *   datalist: {}, // objetos anidados por dimension
  *   totals: { total: {
  *     presupuestado: 999999,
  *     comprometido: 9999,
  *     ....
  *   }},
  *   datatree: {}, // objetos anidados por dimension, para la viz de tree
  *   databubble: {}, // objetos anidados por dimension, para la viz de bubble
  *   loadConcepto: function(concepto) {...} // para recalcular con otro concepto
  * }
  *
   */
  dataHelperService.loadData = function(data, datacsv, dimensiones, conceptos, concepto, mes) {

    if (!datacsv) { throw new Error('debe especificar datacsv'); }

    if (!dimensiones) { throw new Error('debe especificar las dimensiones'); }

    conceptos = conceptos || defaultConceptos;

    concepto = concepto || conceptos[0].name;

    // ver https://github.com/jazzido/viz-ejecucion-presupuestaria/issues/112
    // fijar la consulta en diciembre de 2014
    // #TODO: pensar otra manera de resolver esto
    mes = mes || new Date().getMonth()+1;
    // mes = mes || 12;

    data = data || {};
    data.totals = {};

    data.loadConcepto = function(concepto) {
      if (!this.datalist) { throw new Error('datalist no se ha cargado aun'); }

      this.datatree = dataHelperService.datatree(this.datalist, concepto, true);
      this.databubble = dataHelperService.databubble(this.datalist, concepto, true);
      this.concepto = concepto;
    };

    data.dimensiones = dimensiones;
    data.conceptos = conceptos;
    data.mes = mes;

    var dataparsed = dataHelperService.dataparse(datacsv);

    data.dataraw = dataHelperService.dataByMonth(dataparsed, mes);
    data.lastupdate = dataHelperService.getLastUpdate(data.dataraw, $rootScope.months);
    data.dataready = dataHelperService.dataready(data.dataraw, dimensiones, conceptos);
    data.datalist = dataHelperService.groupBy(data.dataready, dimensiones, false, conceptos);
    data.totals.total = dataHelperService.datatotal(data.datalist, conceptos);
    data.datainfo = dataHelperService.datainfo(data.datalist, data.dataready, data.totals.total);

    data.dataevolution = dataHelperService.dataevolution(dataparsed, dimensiones, conceptos);

    data.loadConcepto(concepto);

    return data;
  };

  dataHelperService.dataevolution = function(data, dimensiones, conceptos) {
    var dataready = dataHelperService.dataready(data, dimensiones, conceptos);
    var dataevolution = dataHelperService.groupBy(
      dataready, dimensiones, false, conceptos, undefined, dataHelperService.calculteTotalsByMonth
    );
    return dataevolution;
  }

  dataHelperService.calculteTotalsByMonth = function(rows, conceptos, monthField) {
    monthField = monthField || 'Mes';

    var totals = [];
    var monthRows;

    for (var month = 1; month <= 12; month++) {
      monthRows = rows.filter(function(row) { return parseFloat(row[monthField]) === month; });
      var total = dataHelperService.calculateTotals(monthRows, conceptos);
      total.mes = month;
      totals.push(total);
    }

    // return [
    //  {
    //    mes: 1,
    //    presupuestado:  calculateTotal(rows, 'Presupuestado'),
    //    comprometido:   calculateTotal(rows, 'Comprometido'),
    //    devengado:      calculateTotal(rows, 'Devengado'),
    //    pagado:         calculateTotal(rows, 'Pagado')
    //    base:           calculateTotal(rows, 'Presupuestado'),
    //  },
    //  {
    //    mes: 2,
    //    ...
    //  }
    // ]

    return totals;
  };

  dataHelperService.calculateTotals = function calculateTotals(rows, conceptos) {
    conceptos = conceptos || defaultConceptos;
    var total = {};

    var calculateTotal = function calculateTotal(rows, gasto) {
      return d3.sum(rows, function(row) {
        return row.gasto === gasto ? parseFloat(row.value) : 0;
      });
    };

    conceptos.forEach(function(concepto) {
      total[concepto.name] = calculateTotal(rows, concepto.field);
    });

    // calculo el concepto base
    var conceptoBase = conceptos.filter(function(concepto) { return concepto.isBase; });
    if (conceptoBase.length === 0) {
      throw new Error('no hay ningún concepto definido como concepto base');
    }
    conceptoBase = conceptoBase[0];

    total.base = total[conceptoBase.name];

    // calculo los porcentajes
    conceptos.forEach(function(concepto) {
      total['porcentaje_' + concepto.name] = (total[concepto.name] * 100 / total.base);
    });

    return total;
  };

  dataHelperService.groupBy = function groupBy(data, keys, simplify, conceptos, parentName, totalizer) {

    simplify = simplify === undefined ? true : simplify;
    conceptos = conceptos || defaultConceptos;
    totalizer = totalizer || dataHelperService.calculateTotals;
    parentName = parentName || '';

    var key = keys[0];
    var keys = keys.slice(1);

    var nextKey = 1;      // to automatically generate the key if it's missing

    var grouped = d3.nest()
    .key(function(row) {
      return (row[key].split('-')[0]).trim();  // get the id
    })
    .rollup(function(data) {
      var currentKey = data[0][key].trim();

      // categoria vacia!
      if (currentKey === '') return null;

      var code = currentKey.split('-');
      var id, name, shortName;

      // id is specified in the key field
      if (code.length >= 2) {
        id = code[0];
        name = code[1];
      // id is NOT in the key field, will generate it
      } else {
        name = currentKey;
        // repeating parent, assign 0 as id
        if (name === parentName) {
          id = 0;
        } else {
          id = nextKey++;
        }
      }

      shortName = dataHelperService._shortName(id, name);

      var grouped = {
        id:         id.toString().trim(),
        name:       name.trim(),
        shortName:  shortName,
        // total:    dataHelperService.calculateTotals(data, conceptos)
        total:      totalizer(data, conceptos)
      };

      // verify if there's an image
      var image = data[0][key + '_imagen'];
      if (image) grouped.image = image;

      // verify if there's an image
      var texto = data[0][key + '_texto'];
      if (texto) grouped.texto = texto;

      // verify if there's an order field, if none, order by shortName
      var order = data[0][key + '_orden'];
      grouped.order = order ? parseFloat(order) : shortName;

      // process children
      if (keys.length >= 1) {
        // llamada recursiva
        var children = groupBy(data, keys, simplify, conceptos, currentKey, totalizer);

        // si retorna undefined, los hijos estan vacios!
        if (children) {
          grouped.children = children;
          grouped.childrenLength = children.keys().length;
        }
      }

      // simplifico hijo
      if (simplify && grouped.children && grouped.childrenLength === 1 ) {
        var child = grouped.children.get(0);
        if (parseInt(child.id) === 0 && child.name === grouped.name ) {
          if (child.children) {
            grouped.children = child.children;
            grouped.childrenLength = child.childrenLength;
          } else {
            delete grouped.children;
            delete grouped.childrenLength;
          }
        }
      }

      grouped.rows = data;

      return grouped;

    })
    .map(data, d3.map);

    // verificar si esta vacio
    var values = grouped.values();
    if (values.length === 1 && values[0] === null) {
      return null;
    }

    return grouped;
  };

  dataHelperService.datatotal = function(data, conceptos) {
    conceptos = conceptos || defaultConceptos;
    var total = {};

    conceptos.forEach(function(concepto) { total[concepto.name] = 0 });

    data.forEach(function(key, row) {
      conceptos.forEach(function(concepto) {
        total[concepto.name] += parseFloat(row.total[concepto.name]);
      });
    });

    // calculo el concepto base
    var conceptoBase = conceptos.filter(function(concepto) { return concepto.isBase; });
    if (conceptoBase.length === 0) {
      throw new Error('no hay ningún concepto definido como concepto base');
    }
    conceptoBase = conceptoBase[0];

    total.base = total[conceptoBase.name];

    // calculo los porcentajes
    conceptos.forEach(function(concepto) {
      total['porcentaje_' + concepto.name] = (total[concepto.name] * 100 / total.base);
    });

    return total;
  };

  dataHelperService.datainfo = function(datalist, rows, total) {
    var info = {
      name: 'info',
      shortName: 'info',
      order: 'info',
      children: datalist,
      childrenLength: datalist.size(),
      rows: rows,
      total: total
    };
    return info;
  };

  dataHelperService.loadChildren = function loadChildren(parent, data, concepto, simplify, fnCreateChild) {

    if (!fnCreateChild) {
      fnCreateChild = function(key, row) {
        return row;
      }
    }

    simplify = simplify === undefined ? true : simplify;
    var children = [];
    data.forEach(function(key, row) {
      var current = fnCreateChild(key, row, parent, data, concepto);

      // llamada recursiva
      if (row.children) {
        current.children = loadChildren(row, row.children, concepto, simplify, fnCreateChild);

        // si solo tiene un hijo, y no tiene nietos

        // si tiene un unico hijo
        if (simplify && current.children.length === 1) {

          var onlychild = current.children[0];

          // si el hijo unico es nodo final (no tiene mas hijo) lo elimino
          if (!onlychild.children) {
            current.children = [];

          // si el hijo unico tiene hijos, promuevo los nietos
          } else if (onlychild.children.length > 1) {
            current.children = onlychild.children;
          }
        }
      }
      children.push(current);
    });
    return children;
  };

  dataHelperService.datatree = function(data, concepto, simplify) {

    concepto = concepto || 'devengado';
    simplify = simplify === undefined ? true : simplify;

    result = {
      // name: 'Presupuesto ' + concepto + ' Total',
      fullName: 'Estado Nacional',
      name: 'Estado Nacional'
    };

    var fnCreateChild = function(key, row, parent, rows, concepto) {
      var child = {
        id: row.id,
        // si el id es un texto, lo mostramos como texto corto
        name: dataHelperService._isNumericCode(row.id) ? row.name : row.id,
        fullName: row.name      // para mostrar el tooltip
      };
      // hoja sin hijos, calculo value
      if (!row.children) {
        child.value = parseFloat(row.total[concepto]);
      }
      return child;
    };

    result.children =
      dataHelperService.loadChildren(null, data, concepto, simplify, fnCreateChild);

    result.findTree = dataHelperService._findTree;

    return result;
  };

  dataHelperService.databubble = function(data, concepto, simplify) {

    concepto = concepto || 'devengado';
    simplify = simplify === undefined ? true : simplify;

    result = {
      label:     'Total ' + concepto,
      fullName:  'Total ' + concepto,
      amount: 0,
      name:   'root',
      id:     'root'
    };

    var fnCreateChild = function(key, row, parent, rows, concepto) {
      return {
        id: row.id,
        // para que los hijos tengan el mismo color que el padre
        name: parent ? parent.id : row.id,
        // si el id es un texto, lo mostramos como texto corto
        label: dataHelperService._isNumericCode(row.id) ? row.name : row.id,
        fullName: row.name,     // para mostrar el tooltip
        amount: parseFloat(row.total[concepto])
      };
    };

    result.children =
      dataHelperService.loadChildren(null, data, concepto, simplify, fnCreateChild);

    // sumo los amount de los hijos
    result.amount = result.children.reduce(function(ac,child) {
      return ac + child.amount;
    }, 0);

    result.findTree = dataHelperService._findTree;

    return result;
  };

  dataHelperService.dataparse = function(dataloaded) {
    return d3.csv.parse(dataloaded);
  };

  dataHelperService.dataByMonth = function(data, mes) {
    mes = mes || new Date().getMonth()+1;

    return data.filter(function(d) { return parseFloat(d.Mes) === mes; });
  };

  dataHelperService.dataready = function(dataraw, keys, conceptos) {

    // campos que voy a copiar al nuevo registro
    var keep =
      'Cod. Ejercicio Presupuestario,Leyenda_Fecha_Act,Mes'.split(',')
      .concat(keys);

    // agrego tambien los campos texto, imagen y orden a los campos a preservar
    keys.forEach(function(key) {
      keep.push(key + '_texto');
      keep.push(key + '_imagen');
      keep.push(key + '_orden');
    });

    // campos con los cuales voy a crear un nuevo registro
    conceptos = conceptos || defaultConceptos;
    gastos = conceptos.map(function(concepto) { return concepto.field; });

    var copy = function(source, keep) {
      var target = {};
      for (key in source) {
        if (keep.indexOf(key) !== -1) target[key] = source[key]; // copio la propiedad
      }
      return target;
    };

    return dataraw.reduce(function(acum, row) {
      var newRows = gastos.map(function(gasto) {
        newRow = copy(row, keep);
        newRow.gasto = gasto;
        newRow.value = parseFloat(row[gasto].replace(',','.'));
        return newRow;
      });
      return acum.concat(newRows);
    }, []);
  };

  dataHelperService._findTree = function _findTree(keys) {
    if (!Array.isArray(keys)) {
      keys = Array.prototype.slice.call(arguments,0);
    }
    return dataHelperService.findTree(this, keys);
  };

  dataHelperService.findTree = function findTree(tree, keys) {
    var findLeaf = function(tree, id) {
      var leaf;
      for (var i=0; i<tree.children.length; i++) {
        leaf = tree.children[i];
        if (leaf.id === id) return leaf;
      }
      return null;
    }

    if (!Array.isArray(keys)) {
      keys = Array.prototype.slice.call(arguments, 1);
    }

    // no more keys to find
    if (keys.length === 0) return tree;

    var leaf = findLeaf(tree, keys[0]);

    // not found
    if (!leaf) return null;

    // recursive call
    return findTree(leaf, keys.slice(1));

  };

  dataHelperService.getLastUpdate = function(dataraw, months) {
    var dateText = dataraw[0].Leyenda_Fecha_Act;
    if (!dateText) return '';

    var parsed = /\:\s*(\d+)\s*(\w+)\s*(\d+).*$/.exec(dateText);

    return parsed[1] + ' de ' + parsed[2].toLowerCase() + ' de ' + parsed[3];
  };

  dataHelperService._isNumericCode = function(code) {
    return /^(\d|\.|-)+$/.test(code.toString().trim());
  };

  dataHelperService._shortName = function(id, code, maxLen) {
    maxLen = maxLen || 30;

    var shortName = code;
    if (!dataHelperService._isNumericCode(id)) shortName = id;

    if (shortName.length > maxLen) {
      shortName = shortName.substr(0, maxLen-3) + '...';
    }
    return shortName;
  };

  dataHelperService.mockData = [
    ['1 - PLN',  '0 - PLN',         '0 - PLN',            100],
    ['1 - PLN',  '0 - PLN',         '1 - AGN',            100],
    ['20 - PN',  '0 - PN',          '204 - AUT FED',      100],
    ['20 - PN',  '0 - PN',          '802 - FONDO NAC',    100],
    ['20 - PN',  '1 - SEC GRAL',    '0 - SEC GRAL',       100],
    ['20 - PN',  '11 - SEC PROGR',  '0 - SEC PROGR',      100]
  ];

  dataHelperService.mockDataraw = function(rows, ejercicio, mes) {
    var gastos = 'Devengado,Comprometido,Pagado,Presupuestado,% Devengado'.split(',');

    ejercicio = ejercicio || new Date().getFullYear();
    mes = mes || new Date().getMonth() + 1;

    return rows.map(function(row) {
      var newRow = {
        'Cod. y Desc. Jurisdiccion':      row[0],
        'Cod. y Desc. Subjurisdiccion':   row[1],
        'Cod. y Desc. Entidad':           row[2],
        'Cod. Ejercicio Presupuestario':  ejercicio.toString(),
        'Mes': mes.toString(),
        'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014."
      };
      gastos.forEach(function(gasto) {
        newRow[gasto] = row[3].toString();
      });
      return newRow;
    });
  };

  dataHelperService.mockRaw = dataHelperService.mockDataraw(dataHelperService.mockData);

  dataHelperService.mockDataready = function(data) {

    var createRow = function(data, ejercicio, mes) {
      var gastos = 'Devengado,Comprometido,Pagado,Presupuestado'.split(',');

      ejercicio = ejercicio || new Date().getFullYear();
      mes = mes || new Date().getMonth() + 1;

      return gastos.map(function(gasto) {
        return {
          'Cod. y Desc. Jurisdiccion':      data[0],
          'Cod. y Desc. Subjurisdiccion':   data[1],
          'Cod. y Desc. Entidad':           data[2],
          'Cod. Ejercicio Presupuestario':  ejercicio.toString(),
          'Mes': mes.toString(),
          'gasto': gasto,
          'value': data[3],
          'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014."
        };
      });
    };

    return data.reduce(function(prev, row) {
      return prev.concat(createRow(row));
    }, []);
  };

  dataHelperService.keys = function(obj) {
    return Object.keys(obj);
  };

  dataHelperService.values = function(obj) {
    return Object.keys(obj).map(function(key) { return obj[key]; } );
  };

  dataHelperService.deepCompare = function deepCompare(o1, o2) {

    var keys = function(o) {
      var keys = [];
      for (var key in o) { keys.push(key) };
      return keys;
    }

    if (o1 === o2) return true;
    if (o1 === null && o2 === null) return true;
    if (o1 === undefined && o2 === undefined) return true;

    if (typeof(o1) !== typeof(o2)) return false;

    if (typeof(o1) === 'object') {
      if (keys(o1).length !== keys(o2).length) return false;

      for (key in o1) {
        if (! deepCompare(o1[key], o2[key])) return false;
      }
      return true;
    }

    // simple data type, not object nor array
    return o1 === o2;
  };

  return dataHelperService;

});

/*

algoritmo para simplificar los nodos el dataset:

si no tiene hijos -> no hago nada
solo tiene 1 hijo, con codigo 0 y misma descripcion que el padre
  promuevo los nietos al nivel de hijo
    y si el nieto esta vacio lo elimino

Ej:

de:
Cod. y Desc. Jurisdiccion       Cod. y Desc. Subjurisdiccion    Cod. y Desc. Entidad
1 - Poder Legislativo Nacional  0  - Poder Legislativo Nacional 0   - Poder Legislativo Nacional
1 - Poder Legislativo Nacional  0  - Poder Legislativo Nacional 1   - Auditoria General de la Nación

a:
Cod. y Desc. Jurisdiccion       Cod. y Desc. Subjurisdiccion    Cod. y Desc. Entidad
1 - Poder Legislativo Nacional  0   - Poder Legislativo Nacional
1 - Poder Legislativo Nacional  1   - Auditoria General de la Nación

de:
Cod. y Desc. Jurisdiccion       Cod. y Desc. Subjurisdiccion    Cod. y Desc. Entidad
20 - Presidencia de la Nación   0  - Presidencia de la Nación   204 - Autoridad Federal de Servicios de Comunicación Audiovisual
20 - Presidencia de la Nación   0  - Presidencia de la Nación   802 - Fondo Nacional de las Artes
20 - Presidencia de la Nación   1  - Secretaría General         0   - Secretaría General
20 - Presidencia de la Nación   11 - Secretaría de Programación 0   - Secretaría de Programación para la Prevención de la Drogadicción y la Lucha contra el Narcotráfico

a:
Cod. y Desc. Jurisdiccion       Cod. y Desc. Subjurisdiccion    Cod. y Desc. Entidad
20 - Presidencia de la Nación   0  - Presidencia de la Nación   204 - Autoridad Federal de Servicios de Comunicación Audiovisual
20 - Presidencia de la Nación   0  - Presidencia de la Nación   802 - Fondo Nacional de las Artes
20 - Presidencia de la Nación   1  - Secretaría General
20 - Presidencia de la Nación   11 - Secretaría de Programación para la Prevención de la Drogadicción y la Lucha contra el Narcotráfico


dataraw: es la información tal como viene de los archivos csv

dataraw = [
    {
        'Cod. y Desc. Jurisdiccion': "1 - Poder Legislativo Nacional",
        'Cod. y Desc. Subjurisdiccion': "0  - Poder Legislativo Nacional",
        'Cod. y Desc. Entidad': "0   - Poder Legislativo Nacional",
        'Mes': "7",
        'Cod. Ejercicio Presupuestario': "2014",
        'Presupuestado': "5361,891791",
        'Comprometido': "3628,30815047",
        'Devengado': "1715,1082706",
        'Pagado': "1660,54123039",
        '% Devengado': "6,87624369665315",
        'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014.",
    }, {
        'Cod. y Desc. Jurisdiccion': "1 - Poder Legislativo Nacional"
        'Cod. y Desc. Subjurisdiccion': "0  - Poder Legislativo Nacional"
        'Cod. y Desc. Entidad': "1   - Auditoria General de la Nación"
        'Mes': "7"
        'Cod. Ejercicio Presupuestario': "2014"
        'Presupuestado': "522,996"
        'Comprometido': "419,95731511"
        'Devengado': "154,90387167"
        'Pagado': "117,83902159"
        '% Devengado': "0,30151293700143"
        'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014."
    }, ...
]

/*

se crea un nuevo registro por cada gasto: Presupuestado, Comprometido, Devengado, Pagado

dataready = [
    {
        'Cod. Ejercicio Presupuestario': "2014",
        'Cod. y Desc. Entidad': "0   - Poder Judicial de la Nación",
        'Cod. y Desc. Jurisdiccion': "5 - Poder Judicial de la Nación",
        'Cod. y Desc. Subjurisdiccion': "0  - Poder Judicial de la Nación",
        'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014.",
        'Mes': "7"
        'gasto': "Devengado",
        'value': 2986.14496759
    }, {
        'Cod. Ejercicio Presupuestario': "2014",
        'Cod. y Desc. Entidad': "0   - Poder Judicial de la Nación",
        'Cod. y Desc. Jurisdiccion': "5 - Poder Judicial de la Nación",
        'Cod. y Desc. Subjurisdiccion': "0  - Poder Judicial de la Nación",
        'Leyenda_Fecha_Act': "Última actualización del ejercicio 2014: 18 Mayo 2014.",
        'Mes': "7"
        'gasto': "Comprometido",
        'value': 4128.24934039
    } [...]


/*

jurisList es la información de d3 en forma de árbol

jurisList.get('1') =
    {
        children: i
            0: Object
                children: i
                    0: Object
                        id: "0"
                        name: "Poder Legislativo Nacional"
                        rows: Array[4]
                        total: Object
                    1: Object
                        id: "1"
                        name: "Auditoria General de la Nación"
                        rows: Array[4]
                        total: Object
                childrenLength: 2
                id: "0"
                name: "Poder Legislativo Nacional"
                rows: Array[8]
                total: Object
        childrenLength: 1
        id: "1"
        name: "Poder Legislativo Nacional"
        rows: Array[8]
        total: Object
    }

jurisList.get('1').children.get(0).children.get(1) =
    {
        id: "1"
        name: "Auditoria General de la Nación"
        rows: Array[4]
        total: {
            comprometido: "419.96"
            devengado: "154.90"
            pagado: "117.84"
            presupuestado: "523.00"
        }
    }
*/

