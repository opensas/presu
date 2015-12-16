var presuApp = angular.module('presu',['ngRoute','angulike']);

// http://okfnlabs.org/bubbletree/demos/random/#/~/random-names--random-amounts
// var COLORS = ['#f0ad4e','#5cb85c','#5bc0de','#d9534f','#601A96','#DFD91A','#69589E'];

// https://github.com/mbostock/d3/wiki/Ordinal-Scales#category20
var COLORS = [
  '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a',
  '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
  '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d',
  '#17becf', '#9edae5'
];

// http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12
// var COLORS = [
//   '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c',
//   '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
// ];

presuApp.config(function($routeProvider) {

  $routeProvider.
    when('/', {
      controller:'homeCtrl',
      templateUrl:'ng-client/modules/home/home.html'
    })

    //Quien
    .when('/quien', {
      templateUrl:'ng-client/modules/quien/quien.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/quien/:bubbletree', {
      templateUrl:'ng-client/modules/quien/quien.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId', {
      templateUrl:'ng-client/modules/quien/poder.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId/jurisdiccion/:jurisdiccionId', {
      templateUrl:'ng-client/modules/quien/jurisdiccion.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId/jurisdiccion/:jurisdiccionId/administracion/:administracionId', {
      templateUrl:'ng-client/modules/quien/administracion.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId/jurisdiccion/:jurisdiccionId/administracion/:administracionId/nivel1/:nivel1Id', {
      templateUrl:'ng-client/modules/quien/nivel1.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId/jurisdiccion/:jurisdiccionId/administracion/:administracionId/nivel1/:nivel1Id/nivel2/:nivel2Id', {
      templateUrl:'ng-client/modules/quien/nivel2.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/poder/:poderId/jurisdiccion/:jurisdiccionId/administracion/:administracionId/nivel1/:nivel1Id/nivel2/:nivel2Id/nivel3/:nivel3Id', {
      templateUrl:'ng-client/modules/quien/nivel3.html',
      resolve:{
        'quienService':function(quienService){
          return quienService.promise;
        }
      },
      reloadOnSearch: false
    })

    //Que
    .when('/que', {
      templateUrl:'ng-client/modules/que/que.html',
      resolve:{
        'queService':function(queService){
          return queService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/inciso/:inciId', {
      templateUrl:'ng-client/modules/que/inciso.html',
      resolve:{
        'queService':function(queService){
          return queService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/inciso/:inciId/principal/:princId', {
      templateUrl:'ng-client/modules/que/principal.html',
      resolve:{
        'queService':function(queService){
          return queService.promise;
        }
      },
      reloadOnSearch: false
    })

    //Para Que
    .when('/paraque', {
      templateUrl:'ng-client/modules/paraque/paraque.html',
      resolve:{
        'paraqueService':function(paraqueService){
          return paraqueService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/finalidad/:finId', {
      templateUrl:'ng-client/modules/paraque/finalidad.html',
      resolve:{
        'paraqueService':function(paraqueService){
          return paraqueService.promise;
        }
      },
      reloadOnSearch: false
    })
    .when('/finalidad/:finId/funcion/:funId', {
      templateUrl:'ng-client/modules/paraque/funcion.html',
      resolve:{
        'paraqueService':function(paraqueService){
          return paraqueService.promise;
        }
      },
      reloadOnSearch: false
    })

    //estáticas
    .when('/acerca', {
      templateUrl:'ng-client/modules/paginas/acerca.html'
    })

    .when('/ayuda', {
      templateUrl:'ng-client/modules/paginas/ayuda.html'
    })

	.when('/apn', {
      templateUrl:'ng-client/modules/paginas/apn.html'
    })//lpadilla
	
    .otherwise({redirectTo:'/'});
});


presuApp.filter('slug', function() {
  return function(input) {
    return input ? input.replace(/ /g, '_') : '';
  }
});

presuApp.run(function ($rootScope, $browser, $templateCache, numberFilter) {

  $rootScope.unslugParams = function(params) {
    var unslug = function(url) {
      return url.replace(/_/g, ' ');
    };
    for (key in params) {
      params[key] = unslug(params[key]);
    };
    return params;
  };

  $rootScope.rand = Math.random();

  $rootScope.formatNumber = function(value, decimals) {
    decimals = decimals === undefined ? 1 : decimals;
    return numberFilter(value, decimals);
  };

  $rootScope.shareText = "Observatorio presupuestario ASAP";

  $rootScope.$on('$viewContentLoaded', function() {
    $templateCache.removeAll();
  });

  $rootScope.width = $('.jumbotron').width();

  $rootScope.breadcrumb = [];

  $rootScope.canChangeConcepto = false;

  $rootScope.month = new Date().getMonth()+1;

  $rootScope.months = {
    '1': 'Enero',
    '2': 'Febrero',
    '3': 'Marzo',
    '4': 'Abril',
    '5': 'Mayo',
    '6': 'Junio',
    '7': 'Julio',
    '8': 'Agosto',
    '9': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre',
  };

  $rootScope.conceptos = ['Anterior', 'Presupuestado','Comprometido','Devengado'];

  $rootScope.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1);

  $rootScope.tooltip.formatNumber = $rootScope.formatNumber;

  $rootScope.setNode = function(node){
    $rootScope.selectednode = node.name;
  };

  //For popover
  $rootScope.$on('$viewContentLoaded', function(e,b){
    setTimeout(function(){
      $('.gasto-popover').popover({trigger: 'hover'});
      $('.info-image-popover').popover({trigger:'hover', html: true, animation: true});
    },1000);
  });

  $rootScope.hideInfoPopover = function() {
    $('.info-image-popover').popover('hide');
  };

  $rootScope.createBars = function(containerId, width, data, x, serie){
    var svg = dimple.newSvg("#chartContainer", width, 600);

    var myChart = new dimple.chart(svg, data);
    myChart.setBounds(60, 30, width-100, 330)
    var xAxis = myChart.addCategoryAxis("x", x);
    myChart.addMeasureAxis("y", "value");
    myChart.addSeries(serie, dimple.plot.bar);
    myChart.addLegend(200, 10, 800, 200, "right");

    myChart.defaultColors = [];

    for (var i = 0; i < COLORS.length; i++) {
      myChart.defaultColors.push(new dimple.color(COLORS[i]));
    };

    myChart.draw();

    // rotate -> http://stackoverflow.com/questions/17791926/how-to-rotate-x-axis-text-in-dimple-js
    xAxis.shapes.selectAll('text').attr('transform', 'translate(10, -10) rotate(50)')

    return myChart;
  };

  $rootScope.createBubble = function(data, containerId, styleList) {

    var color = d3.scale.ordinal().domain(d3.range(0,COLORS.length)).range(COLORS);

    var bubbleStylesByName = {
      root: { color: color(20) },
      otros: { color: color(19) }
    };
    angular.forEach(styleList,function(i,e){
      bubbleStylesByName[e.id+''] = { color: color(i) };
    });

    var tooltip = $rootScope.tooltip;

    var bubbleFormatNumber = function(n, decimals) {
      var fmt = $rootScope.formatNumber;
      decimals = decimals === undefined ? 1 : decimals;
      var prefix = '';
      if (n < 0) {
        n = n*-1;
        prefix = '-';
      }
      if (n >= 1000000000000) return fmt(prefix+Math.round(n / 100000000000)/10, decimals) + 't';
      if (n >= 1000000000) return fmt(prefix+Math.round(n / 100000000)/10, decimals) + 'b';
      if (n >= 1000000) return fmt(prefix+Math.round(n / 100000)/10, decimals) + 'm';
      if (n >= 1000) return fmt(prefix+Math.round(n / 100)/10, decimals) + 'k';
      else return fmt(prefix+n, decimals);
    }

    var bubbletree = new BubbleTree({
      formatNumber: bubbleFormatNumber,
      data: data,
      container: containerId,
      bubbleType: 'plain',
      maxNodesPerLevel: 10,
      tooltipCallback: function(e) {
        // return;
        if (e.type === 'SHOW') {

          tooltip.transition()
            .style("display", "block");

          var html = '<div class="panel panel-default">'
            + '<div class="panel-heading text-center">'
            + (e.node.fullName === e.node.label ? e.node.label : e.node.fullName + ' - ' + e.node.label)
            //+ e.node.label
            + '</div>'
            + '<div class="panel-body text-center">'
            + $('#selectedConceptoForTooltip').html() + ': $'
            + tooltip.formatNumber(e.node.amount);

          if (e.node.parent) {
            html += '<br/>'
              + 'Equivale al '
              + tooltip.formatNumber((e.node.amount*100)/e.node.parent.amount) + '% de'
              + '<br/>'
              + e.node.parent.fullName;
          }

          html+='</div>'
            +'</div>';

          tooltip
            .style('top', (parseInt($('#bubbletree').offset().top)+parseInt(e.bubblePos.y)-parseInt(e.target.bubbleRad)-135) +'px')
            .style('left',(parseInt($('#bubbletree').offset().left)+parseInt(e.bubblePos.x)-200)+'px');

          tooltip.html(html);
        } else if (e.type === 'HIDE') {
          $rootScope.tooltip.transition()
            .style("display", "none");
        }
      },
      //sortBy: 'label',
      nodeClickCallback: function(node){
        $rootScope.setNode(node);
      },
      bubbleStyles: {
        name: bubbleStylesByName
      }
    });

    return bubbletree;

  };

  $rootScope.createTreemap = function(datatree,width){
    var tree = new TreeMap(width, $rootScope.tooltip);
    tree.loadData(angular.copy(datatree));

    return tree;
  };

  $rootScope.objToArray = function(datatable) {

    var ar = [];

    angular.forEach(datatable,function(i,e){
      ar.push(e);
    });

    /*ar.sort(function(a,b){
      if (parseInt(a.id) < parseInt(b.id))
        return -1;
      if (parseInt(a.id) > parseInt(b.id))
        return 1;
      return 0;
    });*/

    return ar;

  };
});
