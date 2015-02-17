//Include gulp, and launch the task loader
var gulp = require('gulp');
var fs = require('fs-extra');

//Manage CLI flags
var args = require('yargs').argv;

//Get all the other modules necessary to build this out
var bourbon = require('node-bourbon');
var browserify = require('gulp-browserify');
var debug = require('gulp-debug');
var jshint = require('gulp-jshint');
var react = require('gulp-react');
var sass = require('gulp-sass');
var watch = require('gulp-watch');



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
		.pipe(gulp.dest('./src/output'))
});



//Lint the JS
gulp.task('lint', function () {
	return gulp.src(['./src/js/**/*(*.jsx|*.js)'])
		//.pipe(react())
		.pipe(jshint({
			expr: true
		})).on('error', handleError)
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
})



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
		.pipe(gulp.dest('./src/output'))
});



//Make a distributable
gulp.task('dist', ['bundle'], function(){
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