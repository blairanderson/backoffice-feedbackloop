//https://www.npmjs.com/package/gulp-awspublish

var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var uglify = require('gulp-uglifyjs');
var request = require('superagent-bluebird-promise');
var config = require('../config').publish;

var publisher = awspublish.create(config.awsCreds);

var TWO_YEAR_CACHE_PERIOD_IN_SEC = 60 * 60 * 24 * 365 * 2;
var headers = {
  'Cache-Control': TWO_YEAR_CACHE_PERIOD_IN_SEC + "",
  'Expires': new Date('2030')
};

gulp.task('publish', [
  'browserify',
  'styles',
  'uglify',
  'pindex',
  'notify'
]);

function local() {
  console.log("Localhost")
  return request.post("http://localhost:3000/widgets")
    .then(staging, function(error) {
      throw "Error in LOCALHOST"
    })
}

function staging() {
  console.log("Staging");
  return request.post("http://staging.getfeedbackloop.com/widgets")
    .then(production, function(error) {
      throw "Error"
    })
}

function production() {
  console.log('Production');
  return request.post("https://www.getfeedbackloop.com/widgets")
    .then(function(res){
      gulp.exit()
    }, function(error) {
      throw "Error" + error
    })
}

gulp.task('notify', local);

gulp.task('pindex', function() {
  return gulp.src(config.src)
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('pindexgzip', function() {
  return gulp.src(config.src)
    .pipe(awspublish.gzip({ext: '.gz'}))
    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))
    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())
    // print upload updates to console
    .pipe(awspublish.reporter());
});

