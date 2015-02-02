var Backbone = require('backbone');

var Resume = require('./resume/resume');
var Page = require('./pages/page');
//var State = require('./state/state');

var Pages = {
	about: require('./pages/about'),
	experience: require('./pages/experience'),
	projects: require('./pages/projects'),
	skills: require('./pages/skills')
};



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		resume: {},
		pages: [],
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
	}/*,{
		key: 'state',
		type: Backbone.One,
		relatedModel: State
	}*/],

	initialize: function(){
		//Add pages
		var pages = this.get('pages');
		var index = 0;
		
		for (var p in Pages) {
			pages.add(new Pages[p]({
				index: index
			}));
			index++;
		}

		pages.comparator = 'index';
	}
});