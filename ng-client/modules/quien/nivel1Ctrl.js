presuApp.controller('nivel1Ctrl', function($scope, $rootScope, $routeParams, quienService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Nivel2';
    $scope.childrenEntity = 'Nivel3';
    $scope.childrenLink =
      'poder/' + $routeParams.poderId + '/' +
      'jurisdiccion/' + $routeParams.jurisdiccionId + '/' +
      'administracion/' + $routeParams.administracionId + '/' +
      'nivel1/' + $routeParams.nivel1Id + '/' +
      'nivel2';

    $scope.camposEjes = ['Nivel2', 'gasto'];
    $scope.campoPrincipal = 'Nivel2';

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

      $scope.nivel1 = $scope.administracion.children.get($routeParams.nivel1Id);

      $scope.mainEntity = $scope.nivel1;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'quien', name: '¿Quién gasta?' },
        { link: 'poder/'+$scope.poder.id, name: $scope.poder.shortName },
        { link:
          'poder/'+$scope.poder.id+'/'+
          'jurisdiccion/'+$scope.jurisdiccion.id, name: $scope.jurisdiccion.shortName },
        { link:
          'poder/'+$scope.poder.id+'/'+
          'jurisdiccion/'+$scope.jurisdiccion.id+'/'+
          'administracion/'+$scope.administracion.id, name: $scope.administracion.shortName },
        { link: false, name: $scope.nivel1.shortName }
      ];

     });

  };

  $scope.filterDataTable = function() {
    return $scope.nivel1.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.poder.id, $scope.jurisdiccion.id, $scope.administracion.id, $scope.nivel1.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.poder.id, $scope.jurisdiccion.id, $scope.administracion.id, $scope.nivel1.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.nivel1.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
