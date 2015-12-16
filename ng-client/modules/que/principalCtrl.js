presuApp.controller('principalCtrl', function($scope, $rootScope, $routeParams, queService) {

  $scope.init = function() {

    $scope.unslugParams($routeParams);

    queService.promise.then(function() {

      $scope.data = queService.getData();

      $rootScope.data = $scope.data;

      $scope.que = $scope.data.datainfo;

      $scope.inciso = $scope.que.children.get($routeParams.inciId);

      $scope.principal = $scope.inciso.children.get($routeParams.princId);

      $scope.mainEntity = $scope.principal;

      $rootScope.breadcrumb = [
        { link: 'que', name: '¿En qué se gasta?' },
        { link: 'inciso/'+$scope.inciso.id, name: $scope.inciso.shortName },
        { link: false, name: $scope.principal.shortName }
      ];

    });
  }

});
