var _ = require('underscore');



var ActionManager = function(manifest, actions) {
	this.manifest = manifest;
	_.extend(this, actions);
};



ActionManager.prototype.execute = function(payload, model) {
	if ( typeof payload === 'object' && payload.actionType && this.manifest && this.manifest[payload.actionType] && typeof this[this.manifest[payload.actionType]] === 'function') {
		this[this.manifest[payload.actionType]](payload, model);
	} else {
		//throw('You did not supply a payload formatted appropriately for the action you tried to execute!');
	}
};



ActionManager.prototype.create = function() {
	return this.execute.bind(this);
};



module.exports = ActionManager;