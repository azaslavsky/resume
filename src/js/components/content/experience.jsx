var React = require('react');
var ModelMixin = require('../_mixins/ModelMixin');
var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	mixins: [ModelMixin()],

	componentWillMount: function(){
		this.model = window.app.model.getPage('experience');
	},

	render: function() {
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