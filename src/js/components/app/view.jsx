var React = require('react');

//Load header, content, and footer
var Header = require('../header/view');
var Content = require('../content/view');
var Footer = require('../footer/view');



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