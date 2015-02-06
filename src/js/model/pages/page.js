var _ = require('underscore');
var Backbone = require('backbone');
var DispatcherRegistrationMixin = require('../_mixins/dispatcherRegistration');



module.exports = Backbone.AssociatedModel.extend(
	_.extend({}, DispatcherRegistrationMixin, {
		defaults: {
			active: false
		}
	})
);