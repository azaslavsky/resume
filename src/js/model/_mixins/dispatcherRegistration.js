var Dispatcher = require('../../dispatcher');



module.exports = {
	//A callback function for this store to interact with the dispatcher
	dispatch: function(payload) {
		this.actions(payload, this);
	},

	//Register this model's dispatcher callback with the global dispatcher, call in each inheritors "initialize" function
	register: function() {
		this.dispatchToken = Dispatcher.register(this.dispatch.bind(this));
	}
};