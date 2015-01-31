var React = require('react');


//Load header, content, and footer
var HeaderView = require('../header/view');



//Render
module.exports = function(){
	React.render(
		/* jshint ignore:start */
		<HeaderView />,
		/* jshint ignore:end */
		document.getElementsByTagName('body')[0]
	);
};