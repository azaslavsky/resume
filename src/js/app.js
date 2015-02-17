var underscore = require('underscore');
var Backbone = require('backbone');
var React = require('react');
var reqwest = require('reqwest');

//Set options for our global libraries, and load single use plugins
require('backbone-associations');
Backbone.ajax = reqwest.compat;
marked.setOptions({
	gfm: true,
	breaks: true
});
React.initializeTouchEvents();

//Markdown settings
var renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
	return '<a href="' + href + '" target="' + (href.match(/^https{0,1}\:\/\//i) instanceof Array ? '_blank' : '_self') + '">' + text + '</a>';
};
marked.setOptions({
	renderer: renderer,
	gfm: true,
	breaks: true
});

//Get JSON data
var resume = require('../json/resume');
var extra = require('../json/extra');
var copy = require('../json/copy');



//Load the fonts
var fonts = document.createElement('link');
fonts.rel = 'stylesheet';
fonts.type = 'text/css';
fonts.href = 'https://fonts.googleapis.com/css?family=Roboto:100,300,300italic,700';
document.head.appendChild(fonts);



//Load the stylesheets
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = './output/style.css';
document.head.appendChild(style);



//Process the resume object
resume.projects = extra.projects;
resume.technologies = extra.technologies;

//Add location and email to profiles
resume.basics.profiles.unshift({
	network: 'mail',
	url: 'mailto:' + resume.basics.email
});



//Load the model and view for the entire app
var AppModel = require('./model/app');
var AppView = require('./components/main/main');

//Create an object store for the entire app
window.app = {
	model: new AppModel({
		resume: resume,
		copy: copy
	}),
	dispatcher: require('./dispatcher')
};

//Start the main view
AppView();