var React = require('react');

//Load header, content, and footer
var Header = require('../header/header');
var Content = require('../content/content');
var Footer = require('../footer/footer');



//Render
module.exports = function(){
	var App = React.createClass({
		render: function() {
			return (
				/* jshint ignore:start */
				<div className="main">
					<Header />
					<Content />
					<Footer />
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