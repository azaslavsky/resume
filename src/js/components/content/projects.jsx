var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	componentWillMount: function(){
		this.model = window.app.model.getPage('projects');
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