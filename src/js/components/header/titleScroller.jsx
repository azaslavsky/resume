var React = require('react');



//View definition
var TitleScrollerView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<div className="titleScroller navbar__title__segment">
				<h1 className="titleScroller__span navbar__title__heading">Alex Zaslavsky</h1>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = TitleScrollerView;