var Backbone = require('backbone');
var PageModel = require('./Page');
var Skill = require('../resume/tag');
var Technology = require('../resume/tag');
var FilterSet = require('../resume/filterSet');
var skillsActions = require('../../actions/skills');



module.exports = PageModel.extend({
	actions: skillsActions,

	defaults: {
		name: 'skills',
		icon: 'tools',
		skills: [],
		technologies: [],
		levels: [],
		filterSet: []
	},

	relations: [{
		key: 'skills',
		type: Backbone.Many,
		relatedModel: Skill
	},{
		key: 'technologies',
		type: Backbone.Many,
		relatedModel: Technology
	},{
		key: 'filterSet',
		type: Backbone.Many,
		relatedModel: FilterSet
	}],

	initialize: function() {
		//Register the dispatching callback
		this.register();

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

		//Loop through the techs AND skills, and get the levels
		var levels = this.get('levels') || [];
		if (!levels.length) {
			_.union(this.get('technologies').toArray(), this.get('skills').toArray()).forEach(function(v){
				if (levels.indexOf(v.get('level')) === -1) {
					levels.push(v.get('level'));
				}
			});
			levels.sort(function(a, b) {
				if(a < b) return -1;
				if(a > b) return 1;
				return 0;
			});
		}

		//Apply the filters
		this.get('filterSet').add({
			section: 'skills',
			filters: [
				{section: 'skills', type: 'level', text: 'All Experience Levels', options: levels}
			]
		});

		this.get('filterSet').add({
			section: 'technologies', 
			filters: [
				{section: 'technologies', type: 'categories', text: 'All Categories', options: categories},
				{section: 'technologies', type: 'level', text: 'All Experience Levels', options: levels}
			]
		});
	},

	//Grab the filters for a particular section
	getFilters: function(section) {
		var filterSet = this.get('filterSet').findWhere({section : section});
		if (filterSet) {
			return filterSet.get('filters');
		}
		return new Backbone.Collection();
	}
});