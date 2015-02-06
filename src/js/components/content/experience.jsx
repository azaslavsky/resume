var React = require('react');
var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	render: function() {
		var education = window.app.model.getCategory('education');

		var work = window.app.model.getCategory('work');

		return (
			/* jshint ignore:start */
			<Page name="experience">
				<h3>Education</h3>
				<h3>Work</h3>
			</Page>
			/* jshint ignore:end */
		);
	}
});