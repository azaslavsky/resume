var Backbone = require('backbone');
var PageModel = require('./Page');
var Project = require('../resume/project');
var Volunteer = require('../resume/volunteer');
var Interest = require('../resume/base');
var Language = require('../resume/base');



module.exports = PageModel.extend({
	defaults: {
		name: 'projects',
		icon: 'bulb',
		projects: [],
		volunteering: [],
		interests: [],
		languages: []
	},

	relations: [{
		key: 'projects',
		type: Backbone.Many,
		relatedModel: Project
	},{
		key: 'volunteering',
		type: Backbone.Many,
		relatedModel: Volunteer
	},{
		key: 'interests',
		type: Backbone.Many,
		relatedModel: Interest
	},{
		key: 'languages',
		type: Backbone.Many,
		relatedModel: Language
	}]
});