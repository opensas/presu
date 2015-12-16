presuApp.controller('jurisdiccionCtrl', function($scope, $rootScope, $routeParams, quienService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Administracion';
    $scope.childrenEntity = 'Nivel1';
    $scope.childrenLink =
      'poder/' + $routeParams.poderId + '/' +
      'jurisdiccion/' + $routeParams.jurisdiccionId + '/' +
      'administracion';

    $scope.camposEjes = ['Administracion', 'gasto'];
    $scope.campoPrincipal = 'Administracion';

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

      $scope.mainEntity = $scope.jurisdiccion;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'quien', name: '¿Quién gasta?' },
        { link: 'poder/'+$scope.poder.id, name: $scope.poder.shortName },
        { link: false, name: $scope.jurisdiccion.shortName }
      ];

     });

  };

  $scope.filterDataTable = function() {
    return $scope.jurisdiccion.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.poder.id, $scope.jurisdiccion.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.poder.id, $scope.jurisdiccion.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.jurisdiccion.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
