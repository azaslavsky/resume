var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

//var SearchView = require('../components/search');
var Avatar = require('./avatar');
var TitleScroller = require('./titleScroller');
var ContactList = require('./contactList');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	getInitialState: function() {
		return {
			contacts: false,
			search: false
		};
	},

	handleCloseContacts: function(e) {
		this.setState({contacts: false});
	},

	onToggleContacts: function(opened) {
		this.setState({contacts: !!opened, search: false});
	},

	onToggleSearch: function(opened) {
		this.setState({contacts: false, search: !!opened});
	},

	render: function() {
		var contactsOpened = this.state.contacts ? ' navbar--contacts' : '';
		var searchOpened = this.state.search ? ' navbar--search' : '';
		return (
			/* jshint ignore:start */
			<div className={'navbar buffer' + contactsOpened + searchOpened}>
				<Avatar model={this.model} img={this.model.getPicture()} onToggleAvatar={this.onToggleContacts} opened={this.state.contacts} />
				<div className="navbar__title flex-row">
					<div className="navbar__title__contact navbar__title__segment flex-row">
						<h1 className="navbar__title__heading">Contact Me</h1>
						<span className="navbar__title__close buffer__icon" onClick={this.handleCloseContacts} />
					</div>
					<TitleScroller model={this.model} />
				</div>
				<ContactList model={this.model.getCategory('basics')} />
			</div>
			/* jshint ignore:end */
		);
	}
});