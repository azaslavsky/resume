var React = require('react');
//var SearchView = require('../components/search');
var Avatar = require('./avatar');
var TitleScroller = require('./titleScroller');
var ContactList = require('./contactList');



//View definition
var HeaderView = React.createClass({
	getInitialState: function() {
		return {
			contacts: false,
			search: false
		};
	},

	handleCloseContacts: function(e) {
		this.setState({contacts: false});
	},

	onToggleContacts: function(open) {
		this.setState({contacts: !!open, search: false});
	},

	onToggleSearch: function(open) {
		this.setState({contacts: false, search: !!open});
	},

	render: function() {
		var contactsOpen = this.state.contacts ? ' navbar--contacts' : '';
		var searchOpen = this.state.search ? ' navbar--search' : '';
		return (
			/* jshint ignore:start */
			<div className={'navbar buffer' + contactsOpen + searchOpen}>
				<Avatar img={window.app.model.get('resume.basics.picture')} onToggleAvatar={this.onToggleContacts} open={this.state.contacts} />
				<div className="navbar__title flex-row">
					<div className="navbar__title__contact navbar__title__segment flex-row">
						<span className="navbar__title__span">Contact Me</span>
						<span className="navbar__title__close buffer__icon" onClick={this.handleCloseContacts} />
					</div>
					<TitleScroller />
				</div>
				<ContactList />
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = HeaderView;