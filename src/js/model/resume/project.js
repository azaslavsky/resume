var _ = require('underscore');
var Backbone = require('backbone');
var BaseModel = require('./base');
var KeywordListMixin = require('./_mixins/keywordList');



module.exports = BaseModel.extend(
	_.extend({}, KeywordListMixin, {
		defaults: {
			stars: '',
			forks: ''
		},

		parse: function(results) {
			var output = {};
			if (results.items && results.items.length) {
				output.stars = typeof results.items[0].stargazers_count === 'number' ? results.items[0].stargazers_count : '';
				output.forks = typeof results.items[0].forks_count === 'number' ? results.items[0].forks_count : '';
			}

			return output;
		},

		initialize: function(){
			this.getKeywords('skills', 'Skills', this.get('highlights'));
			this.getKeywords('stack', 'Stack', this.get('highlights'));

			//If the website is a link to a github repo, create a fetching function, and go get that data!
			if (typeof this.get('website') === 'string' && this.get('website').match(/:\/\/github\.com\/(?:\w*)\/(?:\w*)/i)) {
				//Get the user/org, and the repo name
				var user, repo, queryString = '', fragment = this.get('website').substring( this.get('website').indexOf('github.com/') + 11 );

				if (fragment.length && fragment.indexOf('/') > -1) {
					fragment = fragment.split('/');
					user = fragment[0];
					repo = fragment[1];

					//Set the urlRoot and id
					queryString = 'q=' + repo + 'user:' + user;
					this.urlRoot = 'https://api.github.com/search/repositories?' + queryString;

					this.fetch();
				}

				//this.urlRoot('https://github.com');
			}
		}
	})
);