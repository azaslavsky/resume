var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var About = require('./about');
var Experience = require('./experience');
var Skills = require('./skills');
var Projects = require('./projects');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	//Interface that allows parent components to easily loop through the pages
	getPages: function() {
		return [
			this.refs.about,
			this.refs.experience,
			this.refs.skills,
			this.refs.projects,
		];
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<div className="content">
				<About ref="about" key={0} />
				<Experience ref="experience" key={1} />
				<Skills ref="skills" key={2} />
				<Projects ref="projects" key={3} />
			</div>
			/* jshint ignore:end */
		);
	}
});