presuApp.controller('nivel3Ctrl', function($scope, $rootScope, $routeParams, quienService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    quienService.promise.then(function() {

      $scope.data = quienService.getData();

      $rootScope.data = $scope.data;

      $scope.quien = $scope.data.datainfo;

      $scope.poder = $scope.quien.children.get($routeParams.poderId);

      $scope.jurisdiccion = $scope.poder.children.get($routeParams.jurisdiccionId);

      $scope.administracion = $scope.jurisdiccion.children.get($routeParams.administracionId);

      $scope.nivel1 = $scope.administracion.children.get($routeParams.nivel1Id);

      $scope.nivel2 = $scope.nivel1.children.get($routeParams.nivel2Id);

      $scope.nivel3 = $scope.nivel2.children.get($routeParams.nivel3Id);

      $scope.mainEntity = $scope.nivel3;

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
        { link:
          'poder/'+$scope.poder.id+'/'+
          'jurisdiccion/'+$scope.jurisdiccion.id+'/'+
          'administracion/'+$scope.administracion.id+'/'+
          'nivel1/'+$scope.nivel1.id, name: $scope.nivel1.shortName },
        { link:
          'poder/'+$scope.poder.id+'/'+
          'jurisdiccion/'+$scope.jurisdiccion.id+'/'+
          'administracion/'+$scope.administracion.id+'/'+
          'nivel1/'+$scope.nivel1.id+'/'+
          'nivel2/'+$scope.nivel2.id, name: $scope.nivel2.shortName },
        { link: false, name: $scope.nivel3.shortName }
      ];

    });
  }

});
