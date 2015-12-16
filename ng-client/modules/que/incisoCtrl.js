presuApp.controller('incisoCtrl', function($scope, $rootScope, $routeParams, queService, $location) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Tipo de bien/servicio'; // Principal
    $scope.childrenEntity = '';
    $scope.childrenLink =
      'inciso/' + $routeParams.inciId +
      '/principal';

    $scope.camposEjes = ['Cod. y Desc. Principal','gasto'];
    $scope.campoPrincipal = 'Cod. y Desc. Principal';

    //service reference
    $scope.dataService = queService;

  };

  $scope.partialLoaded = function() {

    queService.promise.then(function() {

      $scope.data = queService.getData();

      $rootScope.data = $scope.data;

      $scope.que = $scope.data.datainfo;

      $scope.inciso = $scope.que.children.get($routeParams.inciId);

      $scope.mainEntity = $scope.inciso;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'que', name: '¿En qué se gasta?' },
        { link: false, name: $scope.inciso.shortName }
      ];

    });

  };

  $scope.filterDataTable = function() {
    return $scope.inciso.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.inciso.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.inciso.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.inciso.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
