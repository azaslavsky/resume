var Backbone = require('backbone');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		expanded: false, //"contact" | "search" | false
		searchString: ''
	}
});