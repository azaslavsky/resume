var Backbone = require('backbone');



module.exports = {
	getKeywords: function(type, lead, strArray){
		var output, list, str;

		this.get('highlights').forEach(function(v, i){
			var index;
			if (!str) {
				index = v.indexOf(lead +':');
				if (index === 0) {
					str = i;
				}
			}
		});

		if (typeof str === 'number' && str > -1) {
			output = [];
			list = strArray[str].split(':')[1];
			list = list.split(', ');

			list.forEach( function(v) {
				output.push( v.toLowerCase().replace('&', '').trim() );
			});

			if (output.length) {
				this.set(type, output);
			}
		}
	}
};