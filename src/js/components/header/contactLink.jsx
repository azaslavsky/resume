var React = require('react');



//View definition
module.exports = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<a className="contact-list__line" target="_blank" href={this.props.url}>
				<span className={'contact-list__icon buffer-icon icon-' + this.props.network.toLowerCase()}></span>
				<span className="contact-list__text">{this.props.children}</span>
			</a>
			/* jshint ignore:end */
		);
	}
});