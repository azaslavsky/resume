var jQuery = require('jquery')(window);
var underscore = require('underscore');
var Backbone = require('backbone');
var React = require('react');

 //Only need to do this once
require('backbone-associations');
Backbone.$ = $;
React.initializeTouchEvents();

//Get JSON data
var resume = require('../json/resume');
var extra = require('../json/extra');



//Load the stylesheet
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
var AppView = require('./components/app/view');

//Create an object store for the entire app
window.app = {
	model: new AppModel({
		resume: resume
	})
};

//Start the main view
AppView();