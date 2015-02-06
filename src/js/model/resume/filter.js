var Backbone = require('backbone');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		section: '',
		type: '',
		text: 'All',
		options: [],
		active: false,
		expanded: false
	}
});