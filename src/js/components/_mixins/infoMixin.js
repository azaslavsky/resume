var _ = require('underscore');



//A mixin that allows React components to have an "info" store, which tracks all non-render prompting state information
module.exports = {
	//Apply changes to the info store; same API as "setState"
	setInfo: function(hashmap) {
		_.each(hashmap, function(v, i) {
			this.info[i] = v;
		}, this);
	},

	//After a component has updated, make sure to update the info as well
	componentDidUpdate: function() {
		this.updateInfo && this.updateInfo();
	},

	//After a component has updated, make sure to update the info as well
	componentDidMount: function() {
		this.updateInfo && this.updateInfo();
	},

	//Set an empty info object if the getInitialInfo method isn't defined
	componentWillMount: function() {
		this.info = (this.getInitialInfo && this.getInitialInfo()) || {};
	}
};