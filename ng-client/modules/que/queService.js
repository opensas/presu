presuApp.service('queService', function($http, $rootScope, dataHelperService) {

  var data = {};

  var promise = $http.get('data/que.csv')
  .success(function (datacsv) {

    var dimensiones = [
      'Cod. y Desc. Inciso',
      'Cod. y Desc. Principal'
    ];

    var conceptos = null; // uso conceptos por defecto

    var concepto = 'devengado';     // #TODO, leer el concepto de algún lado

    var mes = undefined;            // #TODO, leer el mes de algún lado

    dataHelperService.loadData(data, datacsv, dimensiones, conceptos, concepto, mes);

  });

  return {
    promise: promise,
    getData: function() { return data; }
  };

});
