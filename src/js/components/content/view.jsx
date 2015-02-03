var React = require('react');
var About = require('./about');
var Experience = require('./experience');
var Skills = require('./skills');
var Projects = require('./projects');



//View definition
var ContentView = React.createClass({
	getInitialState: function() {
		return {
		};
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<div className="content">
				<About/>
				<Experience/>
				<Skills/>
				<Projects/>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = ContentView;