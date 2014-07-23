var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

var paths = {
  bower: [
  'bower_components/angular/angular.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'bower_components/jquery/dist/jquery.min.js',
  'bower_components/foundation/js/foundation.min.js',
  'bower_components/d3/d3.min.js',
  ],
  npm: ['node_modules/**/*js'],
  app: ['client/*.js']
};

gulp.task('serve', function(){
  nodemon({
    script: 'server.js',
    ext: 'js html',
    ignore: ['client/js/build/**']
  });
});

// compiles angular and other dependencies
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

gulp.task('watch', function() {
  gulp.watch(paths.bower, ['clientBuild']);
  gulp.watch(paths.app, ['appBuild']);
});


gulp.task('compile', ['clientBuild', 'appBuild']);
gulp.task('default', ['compile', 'serve','watch']);
