presuApp.controller('quienCtrl', function($scope, $rootScope, quienService, $location) {

  $scope.init = function() {

    //titles & links
    $scope.currentEntity = "Poder";
    $scope.childrenEntity = "Nivel1";
    $scope.childrenLink = "poder";

    //Bars
    $scope.camposEjes = ["Poder", "gasto"];
    $scope.campoPrincipal = "Poder";

    //service reference
    $scope.dataService = quienService;

  };

  $scope.partialLoaded = function() {

    quienService.promise.then(function() {

      $scope.data = quienService.getData();

      $rootScope.data = $scope.data;

      $scope.quien = $scope.data.datainfo;

      $scope.mainEntity = $scope.quien;

      $rootScope.breadcrumb = [
        {link: false, name: '¿Quién gasta?'}
      ];

    });

  };

  $scope.filterDataTable = function(){
    return $scope.quien.children;
  };

});
