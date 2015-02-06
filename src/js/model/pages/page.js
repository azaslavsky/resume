var Backbone = require('backbone');
var Dispatcher = require('../../dispatcher');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		name: '',
		icon: ''
	},

	//A callback function for this store to interact with the dispatcher
	dispatch: function(payload) {
		this.actions(payload, this);
	},

	//Register this model's dispatcher callback with the global dispatcher, call in each inheritors "initialize" function
	register: function() {
		this.dispatchToken = Dispatcher.register(this.dispatch.bind(this));
	}
});