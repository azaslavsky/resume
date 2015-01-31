var React = require('react');



//View definition
var TitleScrollerView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<div className="titleScroller navbar__title__segment">
				<span className="titleScroller__span navbar__title__span">Alex Zaslavsky</span>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = TitleScrollerView;