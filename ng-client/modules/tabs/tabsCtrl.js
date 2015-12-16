presuApp.factory("sleep", function($timeout) {
  return function(ms) {
    return function(value) {
      return $timeout(function() {
        return value;
      }, ms);
    };
  };
});


presuApp.controller('tabsCtrl', function($scope, $rootScope, $location, $route, $filter, sleep) {

  $scope.init = function(){
    $scope.createTabs();

    //select
    $scope.selectedConcepto = 'Devengado';
    $scope.canChangeConcepto = false;

    $scope.currentTab = 'info';

    $scope.refreshTreemap = false;
    $scope.refreshBubble = false;
  };

  if($scope.dataService){
    $scope.dataService.promise.then(sleep(100)).then(function(){

      // redundante, pero puede cargar primero este promise.
      $scope.data = $scope.dataService.getData();

      $scope.tabledata = $scope.getDataTable();

      $scope.sortTabledata = function(concept, order, value) {
        concept = concept || 'id';
        order = order || 'asc';
        value = value || '';

        var field = concept;
        if (value === 'porcentaje') field = 'porcentaje_' + field;

        var data = $scope.tabledata;

        var cmp = function(a,b) {
          return a === b ? 0 : ( a < b ? -1 : 1);
        };

        if (field === 'id') {
          data = data.sort(function (a,b) { return cmp(a.order, b.order); });
        } else {
          data = data.sort(function (a,b) { return cmp(parseFloat(a.total[field]), parseFloat(b.total[field])); });
        }
        if (order === 'desc') data = data.reverse();

        $scope.tablesort = {
          concept: concept,
          order: order,
          value: value
        };
        $scope.tabledata = data;
      };

      $scope.sortTabledata();

      $scope.showId = function(id) {
        var isNumeric = function(value) {
          return !isNaN(parseFloat(value)) && isFinite(value);
        };
        return !isNumeric(id);
      };

      $scope.loadConceptos($scope.data.conceptos, $scope.data.concepto);

      $scope.changeConcepto = function() {

        //Load data
        $scope.data.loadConcepto(this.selectedConcepto.toLowerCase());
        $scope.data = $scope.dataService.getData();

        //Recreate bubble
        if($scope.bubble && $scope.currentTab == 'bubble'){
          $scope.bubble.clean();
          $scope.bubble = undefined;
          $scope.createBubble();
          $scope.refreshTreemap = true;
        }

        //Recreate treemap
        if($scope.treemap && $scope.currentTab == 'treemap'){
          $scope.treemap.clean();
          $scope.treemap.loadData(datatree);
          $scope.refreshBubble = true;
        }

      };

      var canChangeConceptoArray = [];
      canChangeConceptoArray['treemap'] = true;
      canChangeConceptoArray['bubble'] = true;

      //Not proud about this
      if($location.search().t && $('#tabs a[href="#'+$location.search().t+'"]').size() ){
        var $el = $('#tabs a[href="#'+$location.search().t+'"]');
        $el.tab('show');
        $scope.currentTab = $el.attr('href').replace('#','');
        if($el.attr('data-fn') && $scope[$el.attr('data-fn')]){
          setTimeout(function(){
            $scope[$el.attr('data-fn')]();
          },1000);
        }
        if(canChangeConceptoArray[$location.search().t]){
          $scope.switchSelect(true);
        }
      }

    });
  }

  $scope.loadConceptos = function(conceptos, concepto) {
    $scope.selectedConcepto = concepto;
    $scope.optionsConcepto = conceptos.map(function(concepto) {
      return {
        value: concepto.name,
        text: concepto.title
      };
    });
    $scope.newConceptos = conceptos;
  };

  $scope.getConceptoByValue = function(value) {
    var resp = '';
    angular.forEach($scope.optionsConcepto,function(e,i){
      if(value == e.value){
        resp = e.text;
      }
    });
    return resp;
  };

  $scope.getDataTable = function(){
    return ($scope.filterDataTable)? $rootScope.objToArray($scope.filterDataTable()) : $rootScope.objToArray($scope.data.datalist);
  };

  $scope.getDataTree = function(){
    return ($scope.filterDataTree)? $scope.filterDataTree() : $scope.data.datatree;
  };

  $scope.getDataBubble = function(){
    return ($scope.filterDataBubble)? $scope.filterDataBubble() : $scope.data.databubble;
  };

  $scope.getDataBar = function(){
    return ($scope.filterDataBar)? $scope.filterDataBar() : $scope.data.dataready;
  };

  $scope.switchSelect = function(show){
    $scope.canChangeConcepto = show;
  };

  $scope.createTabs = function(e){
    $('#tabs').on('click','a',function (e) {
      e.preventDefault();
      $(this).tab('show');
      $scope.currentTab = $(this).attr('href').replace('#','');
      if($(this).attr('data-fn') && $scope[$(this).attr('data-fn')]){
        $scope[$(this).attr('data-fn')]();
      }
      $location.search('t',$scope.currentTab);
      window.location = $location.absUrl();
    });
  };

  $scope.createBubble = function(){
    if(!$scope.bubble){
      $scope.bubble = $rootScope.createBubble($scope.getDataBubble(),'#bubbletree',$scope.data.datalist);
    } else if($scope.refreshBubble){
      $scope.refreshBubble = false;
      $scope.bubble.clean();
      $scope.bubble = undefined;
      $scope.createBubble();
    }
  };

  $scope.createTreemap = function(){
    if(!$scope.treemap){
      $scope.treemap = $rootScope.createTreemap($scope.getDataTree(),$('#treemap-container').innerWidth());
    } else if($scope.refreshTreemap){
      $scope.refreshTreemap = false;
      $scope.treemap.clean();
      $scope.treemap.loadData(datatree);
    }
  };

  $scope.createBars = function(){
    if(!$scope.bars){
      $scope.bars =  $rootScope.createBars(
        "#chartContainer",
        $('.jumbotron').width(),
        $scope.getDataBar(),
        $scope.camposEjes,
        $scope.campoPrincipal
      );
    }
  };

});
