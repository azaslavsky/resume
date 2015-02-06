var _ = require('underscore');



//A mixin that allows common model binding functionality to be added to our React Components, so that they play a little nicer with Backbone
module.exports = function(eventMethods){
	var modelMethods = {
		componentBindModel: function() {
			if (this.props.model) {
				this.model = this.props.model;
			}
		},

		componentWillMount: function() {
			this.componentBindModel();
		},

		shouldComponentUpdate: function(newProps) {
			if (typeof newProps.updateDepth === 'number') {
				newProps.updateDepth -= 1;
				if (newProps.updateDepth > -1) {
					console.log(this);
				}
				if (newProps.updateDepth === -1) {
					return true;
					//return false;
				}
			}
			return true;
		}
	};

	//If the component is meant to do forced rendering updates in response to their own model's events, add the event methods as well
	eventMethods && _.extend(modelMethods, {
		componentDidMount: function() {
			this.model && this.model.on('change', this.doForceUpdate, this);
		},

		componentWillUnmount: function() {
			this.model && this.model.off('change', this.doForceUpdate, this);
		},

		doForceUpdate: function(instructions) {
			//Check if the event emitter provided special instructions on how to handle the update
			if (instructions) {
				//If this is a shallow change (ie, only update the top-level view, not its children), mark the component instance until the next rendering cycle is completed
				if (instructions.updateDepth > 0) {
					this.updateDepth = instructions.updateDepth;
				}
			}

			this.forceUpdate();
		},

		componentDidUpdate: function() {
			//Clear the shallowChange tracking property
			this.updateDepth = null;
		}
	});

	return modelMethods;
};