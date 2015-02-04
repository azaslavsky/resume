var Backbone = require('backbone');
var BaseModel = require('./base');



module.exports = BaseModel.extend({
	defaults: {
		expanded: false
	}
});