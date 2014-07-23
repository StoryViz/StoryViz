var gulp = require('gulp');
// var gutil = require('gulp-util');
// var bower = require('bower');
var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var sh = require('gulp-shell');
// var shelljs = require('shelljs');
// var nodemon = require('gulp-nodemon');

var paths = {
  bower: ['bower_components/angular/angular.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'bower_components/d3/d3.min.js'],
  npm: ['node_modules/**/*js'],
  app: ['client/*.js']
};

// compiles css
gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

// compiles angular and other dependencies
gulp.task('client', function(){
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
  gulp.watch(paths.bower, ['clientCompiles']);
});


gulp.task('compile', ['client', 'appBuild']);
gulp.task('default', ['compile', 'watch']);
