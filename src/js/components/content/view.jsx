var React = require('react');
var Page = require('../page/view');
var About = require('./about');
var Experience = require('./experience');



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
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = ContentView;