angular.module('storyviz', [
  'storyviz.services',
  'storyviz.story',
  'storyviz.directives',
  'ui.router'
  ])
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'index.html',
      controller: 'StoryCtrl'
    });
});
