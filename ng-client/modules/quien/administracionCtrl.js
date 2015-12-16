presuApp.controller('administracionCtrl', function($scope, $rootScope, $routeParams, quienService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Nivel1';
    $scope.childrenEntity = 'Nivel2';
    $scope.childrenLink =
      'poder/' + $routeParams.poderId + '/' +
      'jurisdiccion/' + $routeParams.jurisdiccionId + '/' +
      'administracion/' + $routeParams.administracionId + '/' +
      'nivel1';

    $scope.camposEjes = ['Nivel1', 'gasto'];
    $scope.campoPrincipal = 'Nivel1';

    //service reference
    $scope.dataService = quienService;

  };

  $scope.partialLoaded = function() {

    quienService.promise.then(function() {

      $scope.data = quienService.getData();

      $rootScope.data = $scope.data;

      $scope.quien = $scope.data.datainfo;

      $scope.poder = $scope.quien.children.get($routeParams.poderId);

      $scope.jurisdiccion = $scope.poder.children.get($routeParams.jurisdiccionId);

      $scope.administracion = $scope.jurisdiccion.children.get($routeParams.administracionId);

      $scope.mainEntity = $scope.administracion;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'quien', name: '¿Quién gasta?' },
        { link: 'poder/'+$scope.poder.id, name: $scope.poder.shortName },
        { link:
          'poder/'+$scope.poder.id+'/'+
          'jurisdiccion/'+$scope.jurisdiccion.id, name: $scope.jurisdiccion.shortName },
        { link: false, name: $scope.administracion.shortName }
      ];

     });

  };

  $scope.filterDataTable = function() {
    return $scope.administracion.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.poder.id, $scope.jurisdiccion.id, $scope.administracion.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.poder.id, $scope.jurisdiccion.id, $scope.administracion.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.administracion.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
