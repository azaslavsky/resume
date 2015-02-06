var React = require('react');



//View definition
var AvatarView = React.createClass({
	getInitialState: function() {
		return {};
	},

	handleAvatarToggle: function(e) {
		if (this.props.onToggleAvatar) {
			this.props.onToggleAvatar( !this.props.opened );
		} else {
			this.setState({ opened: typeof this.state.opened === 'boolean' ? !this.state.opened : !this.props.opened });
		}
	},

	render: function() {
		var avatarOpened = !(typeof this.state.opened === 'boolean' ? this.state.opened : this.props.opened);
		var avatarOpenedClass = avatarOpened ? ' avatar--opened' : '';
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



//Export
module.exports = AvatarView;