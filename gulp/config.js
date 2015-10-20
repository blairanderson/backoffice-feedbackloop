var dest = './dist';
var src = './src';
var gutil = require('gulp-util');
var fs = require('fs');
var awsCreds = JSON.parse(fs.readFileSync('./aws.json'));

var execSync = require('exec-sync');
var asset_cache_key = execSync('git rev-parse HEAD');
var min_src_output_name = "index." + asset_cache_key + ".min.js";

module.exports = {
  server: {
    settings: {
      root: dest,
      host: 'localhost',
      port: 8080,
      livereload: {
        port: 35929
      }
    }
  },
  sass: {
    src: src + '/styles/**/*.{sass,scss,css}',
    dest: dest + '/styles',
    settings: {
      indentedSyntax: false, // Enable .sass syntax?
      imagePath: '/images' // Used by the image-url helper
    }
  },
  browserify: {
    settings: {
      transform: ['reactify', 'babelify', 'browserify-css']
    },
    src: src + '/js/index.jsx',
    dest: dest + '/js',
    outputName: 'index.js',
    debug: gutil.env.type === 'dev'
  },
  html: {
    src: 'src/index.html',
    dest: dest
  },
  watch: {
    src: 'src/**/*.*',
    tasks: ['build']
  },
  uglify: {
    src: dest + '/js/index.js',
    dest: dest + '/js',
    outputName: min_src_output_name
  },
  publish: {
    src: dest + '/js/index.*.min.js',
    awsCreds: awsCreds
  }
};
