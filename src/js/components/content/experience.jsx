var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Job = require('../entry/job');
var School = require('../entry/school');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('experience');
	},

	renderJobs: function(job, i) {
		return (
			/* jshint ignore:start */
			<Job key={i} model={job} />
			/* jshint ignore:end */
		);
	},

	renderSchools: function(school, i) {
		return (
			/* jshint ignore:start */
			<School key={i} model={school} />
			/* jshint ignore:end */
		);
	},

	renderSection: function(modelName, sectionHeading, iteratee) {
		//Do we have any data for this section (I sure hope so...)?  If not, return undefined
		if (!this.model.get(modelName).length) {
			return undefined;
		}

		//Loop through the entries
		var entries = this.model.get(modelName).map(iteratee);

		return (
			/* jshint ignore:start */
			<Section heading={sectionHeading}>
				{entries}
			</Section>
			/* jshint ignore:end */
		);
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<Page name="experience">
				{ this.renderSection('education', 'Education', this.renderSchools) }
				{ this.renderSection('work', 'Work', this.renderJobs) }
			</Page>
			/* jshint ignore:end */
		);
	}
});