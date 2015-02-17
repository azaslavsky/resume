//Include gulp, and launch the task loader
var gulp = require('gulp');
var fs = require('fs-extra');

//Manage CLI flags
var args = require('yargs').argv;

//Get all the other modules necessary to build this out
var bourbon = require('node-bourbon');
var bowerMain = require('main-bower-files');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var debug = require('gulp-debug');
var jshint = require('gulp-jshint');
var react = require('gulp-react');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');



//Error handling
function handleError (err) {
	console.log(err.toString());
	//process.exit(-1);
	this.emit('end');
}




//Process SCSS
gulp.task('sass', function(){
	return gulp.src('./src/sass/style.scss')
		.pipe(sass({
			includePaths: bourbon.includePaths
		})).on('error', handleError)
		.pipe(gulp.dest('./src/bundle'))
});



//Lint the JS
gulp.task('lint', function () {
	return gulp.src(['./src/js/**/*(*.jsx|*.js)'])
		.pipe(jshint({
			expr: true
		})).on('error', handleError)
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});



//Bundle and minify the libraries
gulp.task('libs', function(){
	return gulp.src(bowerMain({}))
		.pipe(concat('libs.js'))
		.pipe(gulp.dest('./src/bundle'))
});



//Make a single JS bundle
gulp.task('bundle', ['lint'], function(){
	return gulp.src('./src/js/app.js')
		.pipe(browserify({
			//debug: !args.dist,
			file: 'app.js',
			transform: ['reactify'],
			extensions: ['.jsx'],
			bundleExternal: args.dist,
			external: args.dist ? false : [
				'backbone',
				'backbone-associations',
				'marked',
				'react',
				'reqwest',
				'underscore',
				'velocity',
			]
		})).on('error', handleError)
		.pipe(gulp.dest('./src/bundle'))
});



//Export JSON
gulp.task('dist-json', function(){
	return gulp.src('./src/json/**')
		.pipe(gulp.dest('./json/'))
});

//Minify the JS, and output to the "dist" folder
gulp.task('dist-js', ['libs', 'bundle'], function(){
	return gulp.src('./src/bundle/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('./dist/bundle'))
});

//Copy the fonts
gulp.task('dist-icons', function(){
	return gulp.src('./src/icons/fonts/**')
		.pipe(gulp.dest('./dist/bundle/icons'))
});

//Minify the CSS, and output to the "dist" folder
gulp.task('dist-css', ['sass'], function(){
	return gulp.src('./src/bundle/**/*.css')
		.pipe(replace('../../icons/fonts/icomoon', './bundle/icons/icomoon'))
		.pipe(csso())
		.pipe(gulp.dest('./dist/bundle'))
});

//Minify the HTML, and output to the "dist" folder
gulp.task('dist', ['dist-json', 'dist-js', 'dist-icons', 'dist-css'], function(){
	return gulp.src('./src/index.html')
		.pipe(gulp.dest('./dist'))
});



//Load gulp watchers
gulp.task('watch', function(){
	var cssWatcher = watch('./src/sass/**/*(*.sass|*.scss)', function(){
		gulp.start('sass', function(){
			console.log('Style bundle updated');
		});
	});

	var jsWatcher = gulp.watch('./src/*(js|json)/**/*(*.jsx|*.js|*.json)', function(){
		gulp.start('bundle', function(){
			console.log('Browserify bundle updated');
		});
	});
});