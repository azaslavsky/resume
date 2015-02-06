var Backbone = require('backbone');
var PageModel = require('./Page');
var School = require('../resume/school');
var Job = require('../resume/job');



module.exports = PageModel.extend({
	defaults: {
		name: 'experience',
		icon: 'briefcase',
		education: [],
		work: []
	},

	relations: [{
		key: 'education',
		type: Backbone.Many,
		relatedModel: School
	},{
		key: 'work',
		type: Backbone.Many,
		relatedModel: Job
	}]
});