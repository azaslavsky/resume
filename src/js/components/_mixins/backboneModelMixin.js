var _ = require('underscore');



//A mixin that allows common model binding functionality to be added to our React Components, so that they play a little nicer with Backbone
module.exports = {
	//Bind the model, if one exists; otherwise, just use the props
	componentBindModel: function() {
		if (this.props.model) {
			this.model = this.props.model;
		} else {
			//Use "this.model" as an interface for the component's props
			this.model = {
				attributes: this.props,
				get: function(prop){
					return this.props[prop];
				}
			};
		}
	},

	//Bind the model when mounting the component
	componentWillMount: function() {
		this.componentBindModel();
	}
};