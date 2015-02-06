var _ = require('underscore');
var Backbone = require('backbone');
var BaseModel = require('./base');
var FragmentParserMixin = require('./_mixins/fragmentParser');



module.exports = BaseModel.extend(
	_.extend({}, FragmentParserMixin, {
		initialize: function(){
			this.parseFragments('institution', 'area', 'studyType', 'gpa');
		}
	})
);