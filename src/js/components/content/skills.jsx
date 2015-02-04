var React = require('react');
var Page = require('../page/page');



//View definition
var SkillsView = React.createClass({
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
module.exports = SkillsView;