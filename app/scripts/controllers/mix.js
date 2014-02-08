'use strict';

angular.module('cloudtapesApp')
  .controller('MixCtrl', function ($scope) {
  	$scope.tracks = [{
  		name: 'Test1',
  		artist: 'Fake Artist 1'
  	}, {
  		name: 'Test2',
  		artist: 'Fake Artist 2'
  	}]
  });
