var _ = require('underscore');
var Backbone = require('backbone');
var BaseModel = require('./base');
var KeywordListMixin = require('./_mixins/keywordList');



module.exports = BaseModel.extend(
	_.extend({}, KeywordListMixin, {
		initialize: function(){
			this.getKeywords('skills', 'Skills', this.get('highlights'));
			this.getKeywords('stack', 'Stack', this.get('highlights'));
		}
	})
);