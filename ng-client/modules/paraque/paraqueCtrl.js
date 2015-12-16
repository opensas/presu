presuApp.controller('paraqueCtrl', function($scope, $rootScope, paraqueService, $location) {

  $scope.init = function() {

    //titles & links
    $scope.currentEntity = 'Finalidad';
    $scope.childrenEntity = 'Funciones';
    $scope.childrenLink = 'finalidad';

    //Bars
    $scope.camposEjes = ['Finalidad', 'gasto'];
    $scope.campoPrincipal = 'Finalidad';

    //service reference
    $scope.dataService = paraqueService;

  };

  $scope.partialLoaded = function() {

    paraqueService.promise.then(function() {

      $scope.data = paraqueService.getData();

      $rootScope.data = $scope.data;

      $scope.paraque = $scope.data.datainfo;

      $scope.mainEntity = $scope.paraque;

      $rootScope.breadcrumb = [
        {link: false, name: '¿Para qué se gasta?'}
      ];

    });

  };

  $scope.filterDataTable = function() {
    return $scope.paraque.children;
  };

});
