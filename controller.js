

app = angular.module('phonecat', []);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'partials/home.html',   controller: 'HomeCtrl'}).
      when('/names/:player', {templateUrl: 'partials/names.html', controller: 'NamesCtrl'}).
      when('/round/:round/:player', {templateUrl: 'partials/round.html', controller: 'RoundCtrl'}).
      when('/score', {templateUrl: 'partials/score.html', controller: 'ScoreCtrl'}).
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
  $rootScope.buttonTemplate = 'partials/button-primary.html';
  $rootScope.button = 'Add players';
  $rootScope.buttonHref = ''

  $scope.addPlayer = function() {
    $scope.players = db.push('players', $scope.newPlayer.trim());
    $scope.newPlayer = '';

    $rootScope.button = 'Play';
    $rootScope.buttonHref = 'names/' + $scope.players[0];
  };
}

function NamesCtrl($scope, $rootScope, $routeParams, db) {
  $rootScope.buttonTemplate = 'partials/button-primary.html';
  db.set('players', ['John', 'Tom', 'Kvom']);
  var players = db.get('players');
  
  var index = players.indexOf($routeParams.player);

  if (index != (players.length - 1)) {
    $rootScope.button = 'Next player';
    $rootScope.buttonHref = 'names/' + players[ index + 1 ];
  } else {
    $rootScope.button = 'Start';
    $rootScope.buttonHref = 'round/1/' + players[0];
  }

  $scope.player = $routeParams.player;
  $scope.names = new Array();

  $scope.addName = function() {
    db.push('names', $scope.newName.trim());
    $scope.names.push($scope.newName.trim());
    $scope.newName = '';
  };
}

function RoundCtrl($scope, $rootScope, $routeParams, $timeout, $window, db) {
  $rootScope.buttonTemplate = 'partials/button-yes-no.html';
  db.set('players', ['John', 'Tom', 'Kvom']);
  db.set('names', ['Asd', 'Bsd', 'Csd']);

  var names = shuffleArray(db.get('names'));
  var roundSentence = ['explain in words', 'use one word', 'use mimics'];

  $scope.player = $routeParams.player;
  $scope.round = $routeParams.round;
  $scope.roundSentence = roundSentence[$routeParams.round - 1];
  $scope.namesLength = names.length;
  $scope.guessed = 0;
  $scope.name = names[ 0 ];

  $scope.countDown = 1;

  $scope.onTimeout = function() {
    $scope.countDown--;
    if ($scope.countDown > 0) {
      mytimeout = $timeout($scope.onTimeout,1000);
    } else {
      
    }
  }

  var mytimeout = $timeout($scope.onTimeout,1000);

  $rootScope.roundNext = function() {
    var currentIndex = names.indexOf($scope.name);
    if ( !names[currentIndex + 1]) {
      $scope.name = names[0];
    } else {
      $scope.name =  names[currentIndex + 1];
    }
    console.log(names);
    console.log(currentIndex+1);
  };

  $rootScope.roundYes = function() {
    var currentIndex = names.indexOf($scope.name);
    names.splice(currentIndex, 1);
    $scope.name = names[currentIndex];
    $scope.guessed++;

    if ($scope.guessed == $scope.namesLength) {
      $window.location.href = '/#/score';
    }
  }

  var changePlayer = function changePlayer() {
    console.log('changePlayer');
    var currentIndex = players.indexOf($scope.player);
      if (!players[currentIndex + 1]) {
        if ($scope.round == 3) {
          $window.location.href = '/#/score';
        } else {
          $window.location.href = '/#/round/' + ($scope.round + 1) + '/' + players[0];
        }
      } else {
        $window.location.href = '/#/round/' + $scope.round + '/' + players[currentIndex + 1];
        $rootScope.buttonTemplate = 'partials/button-change.html';
        $rootScope.button = 'Start change';
        $rootScope.buttonHref = '/round/' + $scope.round + '/' + players[currentIndex + 1];
        $scope.player = players[currentIndex + 1];
      }

  }

  $rootScope.changePlayer = changePlayer;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}