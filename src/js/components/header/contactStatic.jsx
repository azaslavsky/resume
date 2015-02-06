var React = require('react');



//View definition
module.exports = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<span className="contact-list__line flex-row">
				<span className={'contact-list__icon buffer-icon icon-' + this.props.icon}></span>
				<span className="contact-list__text">{this.props.children}</span>
			</span>
			/* jshint ignore:end */
			//{this.props.text}
			//<span className="contact-list__text">Berkeley, CA, USA, 94702</span>
		);
	}
});