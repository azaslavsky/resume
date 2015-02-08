var React = require('react');



//View definition
module.exports = React.createClass({
	handleAvatarToggle: function(e) {
		this.props.onToggleAvatar && this.props.onToggleAvatar( !this.props.opened );
	},

	render: function() {
		var avatarOpenedClass = this.props.opened ? ' avatar--opened' : '';
		return (
			/* jshint ignore:start */
			<div className={'avatar' + avatarOpenedClass} onClick={this.handleAvatarToggle}>
				<img className="avatar__img" src={this.props.img} />
				<span className="avatar__arrow buffer__icon" />
			</div>
			/* jshint ignore:end */
		);
	}
});