var React = require('react');
var Page = require('../page/view');



//View definition
var AboutView = React.createClass({
	render: function() {
		var projects = window.app.model.getCategory('projects');

		var interests = window.app.model.getCategory('interests');

		return (
			/* jshint ignore:start */
			<Page name="projects">
				<h3>Coding</h3>
				<h3>Recreational</h3>
			</Page>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = AboutView;