var React = require('react');



//View definition
var ContactLinkView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<a className="contact-list__line" target="_blank" href={this.props.url}>
				<span className={'buffer-icon icon-' + this.props.network.toLowerCase()}></span>
				<span className="contact-list__text">{this.props.url}</span>
			</a>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = ContactLinkView;