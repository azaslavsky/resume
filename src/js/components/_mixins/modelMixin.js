var _ = require('underscore');



//A mixin that allows common model binding functionality to be added to our React Components, so that they play a little nicer with Backbone
module.exports = function(eventMethods){
	var modelLoader = {
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

		//Bind the model when mounting the component
		componentWillMount: function() {
			this.componentBindModel();
			this.info = (this.getInitialInfo && this.getInitialInfo()) || {};
		}
	};

	//If the component is meant to do forced rendering updates in response to their own model's events, add the event methods as well
	eventMethods && _.extend(modelLoader, {
		componentDidMount: function() {
			this.updateInfo && this.updateInfo();
			this.model && this.model.on('change', this.doForceUpdate, this);
		},

		componentWillUnmount: function() {
			this.model && this.model.off('change', this.doForceUpdate, this);
		},

		doForceUpdate: function(data) {
			this.beforeForceUpdate && this.beforeForceUpdate(data);
			this.forceUpdate();
			this.afterForceUpdate && this.afterForceUpdate(data);
		},
	});

	return modelLoader;
};