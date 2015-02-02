var Backbone = require('backbone');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		location: {},
		profiles: []
	},

	relations: [{
		key: 'location',
		type: Backbone.One,
		relatedModel: Backbone.AssociatedModel
	},{
		key: 'profiles',
		type: Backbone.Many,
		relatedModel: Backbone.AssociatedModel
	}],

});