var React = require('react');



//View definition
var PageSectionView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<div className="page__section">
				<h3>{this.props.heading}</h3>
				{this.props.children}
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = PageSectionView;