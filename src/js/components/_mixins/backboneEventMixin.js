var _ = require('underscore');



//For "actionable" controller-type React components, there needs to be a way for the component to listen to it's model for events; enter this mixin...
//This mixin can only be used if BackboneModelMixin is loaded first!
module.exports = {
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
	}
};