presuApp.controller('poderCtrl', function($scope, $rootScope, $routeParams, quienService, $location) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    $scope.currentEntity = 'Jurisdiccion';
    $scope.childrenEntity = 'Administracion';
    $scope.childrenLink =
      'poder/' + $routeParams.poderId +
      '/jurisdiccion';

    $scope.camposEjes = ['Jurisdiccion', 'gasto'];
    $scope.campoPrincipal = 'Jurisdiccion';

    //service reference
    $scope.dataService = quienService;

  };

  $scope.partialLoaded = function() {

    quienService.promise.then(function() {

      $scope.data = quienService.getData();

      $rootScope.data = $scope.data;

      $scope.poder = $scope.data.datalist.get($routeParams.poderId);

      $scope.mainEntity = $scope.poder;

      //BreadCrumb
      $rootScope.breadcrumb = [
        { link: 'quien', name: '¿Quién gasta?' },
        { link: false, name: $scope.poder.shortName }
      ];

    });

  };

  $scope.filterDataTable = function() {
    return $scope.poder.children;
  };

  $scope.filterDataTree = function() {
    return $scope.data.datatree.findTree($scope.poder.id);
  };

  $scope.filterDataBubble = function() {
    return $scope.data.databubble.findTree($scope.poder.id);
  };

  $scope.filterDataBar = function() {
    var barsData = [];
    angular.forEach($scope.poder.children, function(skey, svalue) {
      barsData = barsData.concat(svalue.rows);
    });
    return barsData;
  };

});
