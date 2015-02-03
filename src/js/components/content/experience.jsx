var React = require('react');
var Page = require('../page/view');



//View definition
var AboutView = React.createClass({
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



//Export
module.exports = AboutView;