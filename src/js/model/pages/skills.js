var Backbone = require('backbone');
var PageModel = require('./Page');



module.exports = PageModel.extend({
	defaults: {
		name: 'skills',
		icon: 'tools'
	}
});