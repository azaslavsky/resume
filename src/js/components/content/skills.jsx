var React = require('react');
var Page = require('../page/view');



//View definition
var AboutView = React.createClass({
	render: function() {
		var skills = window.app.model.getCategory('skills');
		var technologies = window.app.model.getCategory('technologies');

		return (
			/* jshint ignore:start */
			<Page name="skills">
			</Page>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = AboutView;