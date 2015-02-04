var Backbone = require('backbone');

var Resume = require('./resume/resume');
var Page = require('./pages/page');
var Header = require('./header/header');
var Pages = {
	about: require('./pages/about'),
	experience: require('./pages/experience'),
	skills: require('./pages/skills'),
	projects: require('./pages/projects')
};



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		resume: {},
		pages: [],
		copy: {},
		state: {},
		filters: {}
	},

	relations: [{
		key: 'resume',
		type: Backbone.One,
		relatedModel: Resume
	},{
		key: 'pages',
		type: Backbone.Many,
		relatedModel: Page
	},{
		key: 'header',
		type: Backbone.One,
		relatedModel: Header
	}],

	initialize: function(){
		this._initPages();
		this._initFilters();
	},

	_initPages: function(){
		//Add pages
		var pages = this.get('pages');
		var index = 0;
		
		for (var p in Pages) {
			pages.add( new Pages[p](
				_.extend({}, { 
					index: index,
					selected: !index
				}, this.get('copy').pages[index]) ) );
			index++;
		}

		pages.comparator = 'index';
	},

	_initFilters: function() {
		//Loop through the technologies, and generate the corresponding categories, then sort them alphabetically
		var categories = [];
		this.get('resume.technologies').each(function(v) {
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
		var levels = this.get('copy').levels || [];
		if (!levels.length) {
			_.union(this.get('resume.technologies').toArray(), this.get('resume.skills').toArray()).forEach(function(v){
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
		this.set('filters', {
			skills: [
				{type: 'levels', text: 'All Competencies', options: levels}
			],
			technologies: [
				{type: 'categories', text: 'All Categories', options: categories},
				{type: 'levels', text: 'All Competencies', options: levels}
			]
		});
	},

	getFilter: function(name){
		var filters = this.get('filters');
		if ( filters.hasOwnProperty(name) ) {
			return filters[name];
		}
		return {};
	},

	getPicture: function(){
		return this.get('resume.basics.picture');
	},

	getLocation: function(){
		return this.get('resume.basics.location');
	},

	getSummary: function(){
		return this.get('resume.basics.summary');
	},

	getProfiles: function(){
		return this.get('resume.basics.profiles');
	},

	getCategory: function(cat){
		return this.get('resume').get(cat);
	},

	getPage: function(name, property){
		var page = this.get('pages').findWhere({name: name});
		if (property) {
			return page.get(property);
		}
		return page;
	},

	getHeader: function(){
		return this.get('header.expanded');
	},

	setHeader: function(opening){
		if (opening) {
			this.get('header').set({expanded: opening});
		} else {
			this.get('header').set({expanded: false});
		}
	}

});