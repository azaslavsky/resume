var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');
var Dispatcher = require('../../dispatcher');

//var SearchView = require('../components/search');
var Avatar = require('./avatar');
var TitleScroller = require('./titleScroller');
var ContactList = require('./contactList');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin, BackboneEventMixin],

	handleCloseContacts: function(e) {
		Dispatcher.dispatch({
			actionType: 'header-toggle',
			expand: false
		});
	},

	onToggleContacts: function(opened) {
		Dispatcher.dispatch({
			actionType: 'header-toggle',
			expand: this.model.get('contacts') ? false : 'contacts'
		});
	},

	render: function() {
		var contactsOpened = this.model.get('contacts') ? ' navbar--contacts' : '';
		//var searchOpened = this.model.get('search') ? ' navbar--search' : '';

		return (
			/* jshint ignore:start */
			<div className={'navbar buffer' + contactsOpened}>
				<Avatar key='avatar' img={this.model.getPicture()} onToggleAvatar={this.onToggleContacts} opened={this.model.get('contacts')} />
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