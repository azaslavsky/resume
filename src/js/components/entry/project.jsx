var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin, BackboneEventMixin],

	renderGithubStars: function(){
		return (
			/* jshint ignore:start */
			<span className="entry__heading__stats">
				<span className="entry__heading__icon icon-star" />
				<span className="entry__heading__stat">{ typeof this.model.get('stars') === 'number' ? this.model.get('stars') : '-' }</span>
				<span className="entry__heading__icon icon-fork" />
				<span className="entry__heading__stat">{ typeof this.model.get('forks') === 'number' ? this.model.get('forks') : '-' }</span>
			</span>
			/* jshint ignore:end */
		);
	},

	render: function() {
		var minorHeader, github, date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		if (this.model.get('startDate')) {
			startParts = this.model.get('startDate').split('-');
			if (start.length) {
				start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';

				if (this.model.get('endDate')) {
					endParts = this.model.get('endDate').split('-');
					end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
				}
			}

			date = start + (end ? ' - ' + end : '');
		}

		if (typeof this.model.get('website') === 'string' && this.model.get('website').match(/:\/\/github\.com\/(?:\w*)\/(?:\w*)/i)) {
			//This is a github repo!  Query the Github API to get its stars and forks
			github = this.renderGithubStars();
		}

		if (date || github) {
			minorHeader = function(){
				return (
					/* jshint ignore:start */
					<span>{date}{github}</span>
					/* jshint ignore:end */
				);
			}();
		}

		return (
			/* jshint ignore:start */
			<Entry majorHeader={this.model.get('name')} minorHeader={minorHeader} website={this.model.get('website')}>
				<p>
					{this.model.get('summary')}
				</p>
			</Entry>
			/* jshint ignore:end */
		);
	}
});