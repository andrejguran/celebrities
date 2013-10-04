

app = angular.module('phonecat', []);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'partials/home.html',   controller: 'HomeCtrl'}).
      when('/names/:player', {templateUrl: 'partials/names.html', controller: 'NamesCtrl'}).
      when('/round/:round/:player', {templateUrl: 'partials/round.html', controller: 'RoundCtrl'}).
      when('/change/:round/:player', {templateUrl: 'partials/change.html', controller: 'ChangeCtrl'}).
      when('/score', {templateUrl: 'partials/score.html', controller: 'ScoreCtrl'}).
      otherwise({redirectTo: '/'});
}]);

app.factory('db', function(){
  data = new Array();
  data['score'] = new Array();
  data['roundSentences'] = ['explain in words', 'use one word', 'use mimics'];

  /* TEST 
  data['names'] = ['Asd', 'Bsd', 'Csd'];
  data['namesOriginal'] = data['names'];
  data['players'] = ['John', 'Tom', 'Kvom'];
  data['guessed'] = 0;
  data['numNames'] = data['names'].length;
  /* TEST */

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
    },
    score : function(name) {
      scores = data['score'];
      var added = false;
      for (var i = 0; i < scores.length; i++) {
        if (scores[i].name == name) {
          scores[i].score += 1;
          added = true;
          break;
        }
      }

      if (!added) {
        scores.push({name : name, score : 1});
      }

    }
  };
});

function HomeCtrl($scope, $rootScope, db) {
  $rootScope.buttonTemplate = 'partials/button-primary.html';
  $rootScope.button = 'Add players';
  $rootScope.buttonHref = '#/';

  $scope.addPlayer = function() {
    $scope.players = db.push('players', $scope.newPlayer.trim());
    $scope.newPlayer = '';

    $rootScope.button = 'Play';
    $rootScope.buttonHref = '#/names/' + $scope.players[0];
  };
}

function NamesCtrl($scope, $rootScope, $routeParams, db) {
  $rootScope.buttonTemplate = 'partials/button-primary.html';
  var players = db.get('players');
  
  var index = players.indexOf($routeParams.player);

  if (index != (players.length - 1)) {
    $rootScope.button = 'Next player';
    $rootScope.buttonHref = '#/names/' + players[ index + 1 ];
  } else {
    $rootScope.button = 'Start';
    $rootScope.buttonHref = '#/round/1/' + players[0];
  }

  $scope.player = $routeParams.player;
  $scope.names = new Array();

  $scope.addName = function() {
    db.push('names', $scope.newName.trim());
    db.push('namesOriginal', $scope.newName.trim());
    $scope.names.push($scope.newName.trim());
    db.set('numNames', db.get('names').length);
    $scope.newName = '';
  };
}

function RoundCtrl($scope, $rootScope, $routeParams, $timeout, $window, db) {
  $rootScope.buttonTemplate = 'partials/button-yes-no.html';

  if (db.get('players').indexOf($routeParams.player) == 0) {
    db.set('names', db.get('namesOriginal').slice(0));
    db.set('guessed', 0);
  }


  var names = shuffleArray(db.get('names'));
  var roundSentence = db.get('roundSentences');

  $scope.player = $routeParams.player;
  $scope.round = $routeParams.round;
  $scope.roundSentence = roundSentence[$routeParams.round - 1];
  $scope.namesLength = db.get('numNames');
  $scope.guessed = db.get('guessed');
  $scope.name = names[ 0 ];

  $scope.countDown = 3;

  $scope.onTimeout = function() {
    $scope.countDown--;
    if ($scope.countDown > 0) {
      mytimeout = $timeout($scope.onTimeout,1000);
    } else {
       $window.location.href = '/#/change/' + $scope.round + '/' + $scope.player;
    }
  }
  var mytimeout = $timeout($scope.onTimeout,1000);

  $scope.$on('$destroy', function(){
      $timeout.cancel(mytimeout);
  });

  $rootScope.roundNext = function() {
    var currentIndex = names.indexOf($scope.name);
    if ( !names[currentIndex + 1]) {
      $scope.name = names[0];
    } else {
      $scope.name =  names[currentIndex + 1];
    }
  };

  $rootScope.roundYes = function() {
    var currentIndex = names.indexOf($scope.name);
    names.splice(currentIndex, 1);
    db.set('names', names);
    db.set('guessed', ++$scope.guessed);

    if ( !names[currentIndex] ) {
      $scope.name = names[0];
    } else {
      $scope.name =  names[currentIndex];
    }

    db.score($scope.player);

    if ($scope.guessed == $scope.namesLength) {
      if ($scope.round == 3) {
        $window.location.href = '/#/score';
      } else {
        $window.location.href = '/#/change/' + (parseInt($scope.round) + 1) + '/';
      }
    }
  }

}

function ChangeCtrl($scope, $rootScope, $routeParams, $window, db) {
  //check last round, last player
  if ($routeParams.round == 3 && db.get('players').indexOf($routeParams.player) == (db.get('players').length - 1)) {
    $window.location.href = '/#/score';
  }

  var roundSentence = db.get('roundSentences');
  var players = db.get('players');

  $scope.player = $routeParams.player;
  $scope.round = $routeParams.round;
  $scope.namesLength = db.get('numNames');
  $scope.guessed = db.get('guessed');

  $scope.nextPlayer = (players[ players.indexOf($scope.player) + 1 ] ? players[ players.indexOf($scope.player) + 1 ] : players[0]);
  $scope.nextRound = (players[ players.indexOf($scope.player) + 1 ] ? $scope.round : (parseInt($scope.round) + 1));
 
  $scope.roundSentence = roundSentence[$scope.nextRound - 1];

  $rootScope.buttonTemplate = 'partials/button-primary.html';
  $rootScope.button = 'Start';
  $rootScope.buttonHref = '#/round/' + $scope.nextRound + '/' + $scope.nextPlayer;

}

function ScoreCtrl($scope, $rootScope, $routeParams, $window, db) {  
  $rootScope.buttonTemplate = 'partials/button-primary.html';
  $rootScope.button = 'New game';
  $rootScope.buttonHref = '/';
  $scope.scores = db.get('score').sort(function(a,b) {
    return b.score - a.score;
  });
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