var Backbone = require('backbone');
var PageModel = require('./Page');
var School = require('../resume/project');
var Interest = require('../resume/base');
var Language = require('../resume/base');



module.exports = PageModel.extend({
	defaults: {
		name: 'projects',
		icon: 'bulb',
		projects: [],
		interests: [],
		langauges: []
	},

	relations: [{
		key: 'projects',
		type: Backbone.Many,
		relatedModel: School
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