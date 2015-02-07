var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

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