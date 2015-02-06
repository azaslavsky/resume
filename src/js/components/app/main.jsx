var React = require('react');
var ModelMixin = require('../_mixins/ModelMixin');

//Load header, content, and footer
var Header = require('../header/header');
var Content = require('../content/content');
var Footer = require('../footer/footer');



//Render
module.exports = function(){
	var App = React.createClass({
		mixins: [ModelMixin(true)],

		componentWillMount: function(){
			this.model = window.app.model;
		},

		render: function() {
			return (
				/* jshint ignore:start */
				<div className="main">
					<Header ref="header" model={this.model} />
					<Content ref="content" model={this.model} />
					<Footer ref="footer" model={this.model} />
				</div>
				/* jshint ignore:end */
			);
		}
	});

	React.render(
		/* jshint ignore:start */
		<App />, 
		/* jshint ignore:end */
		document.getElementsByTagName('body')[0]
	);
};