var Backbone = require('backbone');



module.exports = Backbone.AssociatedModel.extend({
	//Make this model searchable
	queryList: function() {
		var query = [];
		var aliases = this.get('aliases');
		if (aliases instanceof Array && aliases.length) {
			aliases.forEach(function(v, i) {
				typeof v === 'string' && query.push( v.toLowerCase().trim() );
			});
		}
		this.get('name') && query.unshift( this.get('name').toLowerCase().trim() );
		query.length && this.set('query', query);
	},

	//Searchable keywords
	keywordList: function() {
		this.get('keywords') instanceof Array && this.set('keywords', this.get('keywords').map(function(v) {
			return v.toLowerCase().trim();
		}));
	},

	initialize: function(){
		this.queryList();
		this.keywordList();
	}
});