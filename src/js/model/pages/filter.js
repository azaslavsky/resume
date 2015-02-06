var Backbone = require('backbone');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		type: '',
		text: 'All',
		options: []
	}
});