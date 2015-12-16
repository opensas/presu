presuApp.service('quienService', function($http, $rootScope, dataHelperService) {

  var data = {};

  var promise = $http.get('data/quien.csv')
  .success(function(datacsv) {

    var dimensiones = [
      'Poder',
      'Jurisdiccion',
      'Administracion',
      'Nivel1',
      'Nivel2',
      'Nivel3'
    ];

    var conceptos = null; // uso conceptos por defecto

    var concepto = 'devengado';

    var mes = undefined;

    dataHelperService.loadData(data, datacsv, dimensiones, conceptos, concepto, mes);
  });

  return {
    promise: promise,
    getData: function() { return data; },
  };

});
