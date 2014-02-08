'use strict';

angular.module('cloudtapesApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/mix', {
        templateUrl: 'views/mix.html',
        controller: 'MixCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });