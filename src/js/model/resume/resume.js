var Backbone = require('backbone');

var Basics = require('./basics');
var School = require('./school');
var Job = require('./job');
var Project = require('./project');
var Skill = require('./tag');
var Technology = require('./tag');
var Volunteer = require('./volunteer');
var Language = require('./base');
var Interest = require('./base');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		basics: {},
		education: [],
		work: [],
		projects: [],
		skills: [],
		technologies: [],
		volunteering: [],
		languages: [],
		interests: []
	},

	relations: [{
		key: 'basics',
		type: Backbone.One,
		relatedModel: Basics
	},{
		key: 'education',
		type: Backbone.Many,
		relatedModel: School
	},{
		key: 'work',
		type: Backbone.Many,
		relatedModel: Job
	},{
		key: 'projects',
		type: Backbone.Many,
		relatedModel: Project
	},{
		key: 'skills',
		type: Backbone.Many,
		relatedModel: Skill
	},{
		key: 'technologies',
		type: Backbone.Many,
		relatedModel: Technology
	},{
		key: 'volunteering',
		type: Backbone.Many,
		relatedModel: Volunteer
	},{
		key: 'languages',
		type: Backbone.Many,
		relatedModel: Language
	},{
		key: 'interests',
		type: Backbone.Many,
		relatedModel: Interest
	}]
});