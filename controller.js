

app = angular.module('phonecat', []);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'partials/home.html',   controller: 'HomeCtrl'}).
      when('/names', {templateUrl: 'partials/names.html', controller: 'NamesCtrl'}).
      when('/round', {templateUrl: 'partials/round.html', controller: 'CelebrityCtrl'}).
      when('/score', {templateUrl: 'partials/score.html', controller: 'CelebrityCtrl'}).
      when('/change', {templateUrl: 'partials/change.html', controller: 'CelebrityCtrl'}).
      otherwise({redirectTo: '/'});
}]);

app.factory('db', function(){
  data = new Array();
  return {
    set : function(name, value) {
      return data[name] = value;
    },
    get : function (name) {
      return data[name];
    },
    push : function(name, value) {
      if ( !Array.isArray(data[name]) )
        data[name] = new Array();

      data[name].push(value);
      return data[name];
    }
  };
});

function HomeCtrl($scope, $rootScope, db) {
  $scope.addPlayer = function() {
    $scope.players = db.push('players', $scope.newPlayer.trim());
    $scope.newPlayer = '';
  };

  $rootScope.button = 'Start';
  $rootScope.buttonHref = 'names'
}

function NamesCtrl($scope, $rootScope, db) {
  console.log(db.get('players'));
  $rootScope.button = 'Play';
  $rootScope.buttonHref = 'round'
}