var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Project = require('../entry/project');
var Volunteer = require('../entry/volunteer');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('projects');
	},

	renderProjects: function(project, i) {
		return (
			/* jshint ignore:start */
			<Project key={i} model={project} />
			/* jshint ignore:end */
		);
	},

	renderVolunteering: function(volunteer, i) {
		return (
			/* jshint ignore:start */
			<Volunteer key={i} model={volunteer} />
			/* jshint ignore:end */
		);
	},

	renderInterests: function() {
		return (
			/* jshint ignore:start */
			<Section heading="Recreational">
				<p>
					{this.model.get('interests').pluck('name').join(', ')}
				</p>
			</Section>
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
			<Page name="projects">
				{ this.renderInterests('interests') }
				{ this.renderSection('projects', 'Coding', this.renderProjects) }
				{ this.renderSection('volunteering', 'Volunteering', this.renderVolunteering) }
			</Page>
			/* jshint ignore:end */
		);
	}
});