presuApp.controller('finalidadCtrl', function($scope, $rootScope, $routeParams, paraqueService, $location) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Función';
    $scope.childrenEntity = '';
    $scope.childrenLink = 'finalidad/'+$routeParams.finId+'/funcion';

    $scope.camposEjes = ['Cod. y Desc. Funcion','gasto'];
    $scope.campoPrincipal = 'Cod. y Desc. Funcion';

    //service reference
    $scope.dataService = paraqueService;

  };

  $scope.partialLoaded = function() {

    paraqueService.promise.then(function() {

      $scope.data = paraqueService.getData();

      $rootScope.data = $scope.data;

      $scope.paraque = $scope.data.datainfo;

      $scope.finalidad = $scope.paraque.children.get($routeParams.finId);

      $scope.mainEntity = $scope.finalidad;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'paraque', name: '¿Para qué se gasta?' },
        { link: false, name: $scope.finalidad.shortName }
      ];

    });

  };

  $scope.filterDataTable = function() {
    return $scope.finalidad.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.finalidad.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.finalidad.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.finalidad.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
