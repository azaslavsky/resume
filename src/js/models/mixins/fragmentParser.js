var Backbone = require('backbone');
var minors = require('title-case-minors');



module.exports = {
	parseFragments: function(){
		var fields, output = [];
		fields = Array.prototype.slice.call(arguments);

		fields.forEach(function(v) {
			var modified, words;
			//Remove punctuation, upper->lower, and trime whitespace at beginning and end
			modified = this.get(v).replace(/[^\w\s]/gi, '').toLowerCase().trim();

			//Split into an array of words
			words = modified.split(' ');

			//Remove all "minor" words like "the" and "with," etc
			words.forEach(function(vv){
				if (minors.indexOf(vv) === -1 && output.indexOf(vv) === -1) {
					output.push(vv);
				}
			});
		}.bind(this));

		output.length && this.set('query', output);
	}
};