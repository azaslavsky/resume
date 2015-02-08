var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	render: function() {
		var degree, date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		if (this.model.get('studyType') && this.model.get('studyType')) {
			degree = this.model.get('studyType') + ', ' + this.model.get('area');
		} else if (!this.model.get('studyType')) {
			degree = this.model.get('area');
		} else if (!this.model.get('area')) {
			degree = this.model.get('studyType');
		}

		startParts = this.model.get('startDate').split('-');
		start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';
		if (this.model.get('endDate')) {
			endParts = this.model.get('endDate').split('-');
			end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
		}
		date = start + (end ? ' - ' + end : '');

		return (
			/* jshint ignore:start */
			<Entry majorHeader={this.model.get('institution')} minorHeader={' | ' + (degree ? degree + ' | ' : '') + date}>
				<p>
					{'GPA: ' + this.model.get('gpa')}
				</p>
			</Entry>
			/* jshint ignore:end */
		);
	}
});