var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	render: function() {
		var date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		startParts = this.model.get('startDate').split('-');
		start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';
		if (this.model.get('endDate')) {
			endParts = this.model.get('endDate').split('-');
			end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
		}
		date = start + (end ? ' - ' + end : '');

		return (
			/* jshint ignore:start */
			<Entry majorHeader={this.model.get('organization')} minorHeader={' | ' + this.model.get('position') + ' | ' + date} website={this.model.get('website')}>
				<p>
					{this.model.get('summary')}
				</p>
			</Entry>
			/* jshint ignore:end */
		);
	}
});