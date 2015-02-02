var Backbone = require('backbone');

var Basics = require('./basics');
var School = require('./school');
var Job = require('./job');
var Project = require('./project');
var Skill = require('./base');
var Technology = require('./base');
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
		languages: [],
		interests: [],
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
		key: 'languages',
		type: Backbone.Many,
		relatedModel: Language
	},{
		key: 'interests',
		type: Backbone.Many,
		relatedModel: Interest
	}],

	initialize: function(){
		//Loop through the technologies, and generate the corresponding categories, then sort them alphabetically
		var categories = [];
		this.get('technologies').each(function(v) {
			v.get('categories').forEach(function(vv) {
				if (categories.indexOf(vv) === -1) {
					categories.push(vv);
				}
			});
		});
		categories.sort(function(a, b) {
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		});
		this.set('categories', categories);

		//Loop through the techs AND skills, and get the levels
		var levels = [];
		_.union(this.get('technologies').toArray(), this.get('skills').toArray()).forEach(function(v){
			if (levels.indexOf(v.get('level')) === -1) {
				levels.push(v.get('level'));
			}
		});
		/*levels.sort(function(a, b) {
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		});*/
		this.set('levels', levels);
	}
});