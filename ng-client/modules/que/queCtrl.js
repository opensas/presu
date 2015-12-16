presuApp.controller('queCtrl', function($scope, $rootScope, queService, $location) {

  $scope.init = function() {

    //titles & links
    $scope.currentEntity = 'Grupo de bien/servicio';   // Inciso
    $scope.childrenEntity = 'Principales';
    $scope.childrenLink = 'inciso';

    //Bars
    $scope.camposEjes = ['Cod. y Desc. Inciso','gasto'];
    $scope.campoPrincipal = 'Cod. y Desc. Inciso';

    //service reference
    $scope.dataService = queService;

  };

  $scope.partialLoaded = function() {

    queService.promise.then(function() {

      $scope.data = queService.getData();

      $rootScope.data = $scope.data;

      $scope.que = $scope.data.datainfo;

      $scope.mainEntity = $scope.que;

      $rootScope.breadcrumb = [
        {link: false, name: '¿En qué se gasta?'}
      ];

    });

  };

  $scope.filterDataTable = function() {
    return $scope.que.children;
  };
});
