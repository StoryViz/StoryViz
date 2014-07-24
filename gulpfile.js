var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');

gulp.task('install', shell.task([
          'npm i',
          'bower i'
          ]));

var paths = {
  bower: [
  'bower_components/jquery/dist/jquery.js',
  'bower_components/angular/angular.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js',
  'bower_components/foundation/js/foundation.min.js',
  'bower_components/d3/d3.js',
  ],
  app: ['client/*.js']
};

gulp.task('clientBuild', function(){
  gulp.src(paths.bower)
    .pipe(concat('clientCompiled.js'))
    .pipe(gulp.dest('client/js/build/'));
});

gulp.task('appBuild', function(){
  gulp.src(paths.app)
    .pipe(concat('appCompiled.js'))
    .pipe(gulp.dest('client/js/build/'));
});

gulp.task('compile', ['clientBuild', 'appBuild']);

gulp.task('serve', function(){
  nodemon({
    script: 'server.js',
    ext: 'js html',
    ignore: ['client/js/build/**']
  })
  .on('change', ['compile'])
  .on('restart', function(){
    console.log('restarted');
  });
});

gulp.task('default', ['compile', 'serve']);

gulp.task('init', ['install'], function(){
  gulp.run();
});
