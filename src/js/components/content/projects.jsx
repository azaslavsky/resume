var React = require('react');
var ModelMixin = require('../_mixins/ModelMixin');
var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	mixins: [ModelMixin()],

	componentWillMount: function(){
		this.model = window.app.model.getPage('proejects');
	},

	render: function() {
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