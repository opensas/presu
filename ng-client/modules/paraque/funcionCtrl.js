presuApp.controller('funcionCtrl', function($scope, $rootScope, $routeParams, paraqueService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    paraqueService.promise.then(function() {

      $scope.data = paraqueService.getData();

      $rootScope.data = $scope.data;

      $scope.paraque = $scope.data.datainfo;

      $scope.finalidad = $scope.paraque.children.get($routeParams.finId);

      $scope.funcion = $scope.finalidad.children.get($routeParams.funId);

      $scope.mainEntity = $scope.funcion;

      $rootScope.breadcrumb = [
        { link: 'paraque', name: '¿Para qué se gasta?' },
        { link: 'finalidad/'+$scope.finalidad.id, name: $scope.finalidad.shortName },
        { link: false, name: $scope.funcion.shortName }
      ];

    });
  }

});
