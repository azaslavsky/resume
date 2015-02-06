var Backbone = require('backbone');
var PageModel = require('./Page');
var Basics = require('../resume/basics');



module.exports = PageModel.extend({
	defaults: {
		name: 'about',
		icon: 'user',
		basics: {}
	},

	relations: [{
		key: 'basics',
		type: Backbone.One,
		relatedModel: Basics
	}]
});