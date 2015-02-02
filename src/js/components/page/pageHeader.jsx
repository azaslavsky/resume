var React = require('react');



//View definition
var PageHeaderView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<div className="page__header">
				<span className={'page__icon icon-' + this.props.icon} />
				<h2 className="page__heading">{this.props.text}</h2>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = PageHeaderView;