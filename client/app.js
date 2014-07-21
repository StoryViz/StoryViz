angular.module('storyviz', [
  'storyviz.services',
  'storyviz.story',
  'storyviz.directives',
  'ui.router',
  'd3'
  ])
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider
    .state('story', {
      url: '/story',
      templateUrl: 'story.html',
      controller: 'StoryController'
    })
    .state('landing', {
      url: '/landing',
      templateUrl: 'landing.html'
    });
});
