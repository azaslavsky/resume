var _ = require('underscore');



//A mixin that allows common model binding functionality to be added to our React Components, so that they play a little nicer with Backbone
module.exports = function(eventMethods){
	var modelMethods = {
		componentBindModel: function(){
			if (this.props.model) {
				this.model = this.props.model;
			}
		},

		componentWillMount: function(){
			this.componentBindModel();
		}
	};

	//If the component is meant to do forced rendering updates in response to model events, add the event methods as well
	eventMethods && _.extend(modelMethods, {
		componentDidMount: function() {
			this.model && this.model.on('change', this.doForceUpdate, this);
		},

		componentWillUnmount: function() {
			this.model && this.model.off('change', this.doForceUpdate, this);
		},

		doForceUpdate: function(){
			this.forceUpdate();
		}
	});

	return modelMethods;
};