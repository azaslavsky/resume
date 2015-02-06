var Backbone = require('backbone');
var Filter = require('./filter');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		section: '',
		filters: []
	},

	relations: [{
		key: 'filters',
		type: Backbone.Many,
		relatedModel: Filter
	}]
});