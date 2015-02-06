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



//Page and resume block pairings
var pageRefs = {
	about: ['basics'],
	experience: ['education', 'work'],
	skills: ['skills', 'technologies'],
	projects: ['projects', 'interests', 'languages']
};



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		resume: {},
		pages: [],
		copy: {},
		state: {}
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
		//Add pages
		var pages = this.get('pages');
		var index = 0;
		var resume = this.get('resume');
		var thisRef;
		var thisPage;
		
		for (var p in Pages) {
			thisRef = {};
			/* jshint ignore:start */
			pageRefs[p].forEach(function(v){
				thisRef[v] = resume.get(v);
			});
			/* jshint ignore:end */

			thisPage = new Pages[p](
				_.extend(thisRef, { 
					index: index,
					selected: !index
				}, this.get('copy').pages[index])
			);
			thisPage.parents.push(this);

			pages.add(thisPage);
			index++;
		}

		pages.comparator = 'index';
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