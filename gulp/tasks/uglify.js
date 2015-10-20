var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
var config = require('../config').uglify;

gulp.task('uglify', function() {
  gulp.src(config.src)
    .pipe(uglify(config.outputName))
    .pipe(gulp.dest(config.dest))
});
