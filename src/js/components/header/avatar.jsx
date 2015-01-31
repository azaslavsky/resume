var React = require('react');



//View definition
var AvatarView = React.createClass({
	getInitialState: function() {
		return {};
	},

	handleAvatarToggle: function(e) {
		if (this.props.onToggleAvatar) {
			this.props.onToggleAvatar(!this.props.open);
		} else {
			this.setState({open: typeof this.state.open === 'boolean' ? !this.state.open : !this.props.open});
		}
	},

	render: function() {
		var avatarOpen = !(typeof this.state.open === 'boolean' ? this.state.open : this.props.open);
		var avatarOpenClass = avatarOpen ? ' avatar--open' : '';
		return (
			/* jshint ignore:start */
			<div className={'avatar' + avatarOpenClass} onClick={this.handleAvatarToggle}>
				<img className="avatar__img" src={this.props.img} />
				<span className="avatar__arrow buffer__icon" />
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = AvatarView;