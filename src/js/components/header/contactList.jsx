var React = require('react');
var ContactStatic = require('./contactStatic');
var ContactLink = require('./contactLink');



//View definition
var ContactListView = React.createClass({
	render: function() {
		//Make the static line
		var location = window.app.model.getLocation();
		var locationStr = location.get('city') +', '+ location.get('region') +', '+ location.get('countryCode') +', '+ location.get('postalCode');

		//Make the linked lines
		var links = window.app.model.getProfiles().map(function(link) {
			//https://regex101.com/r/pB7uD7/1
			return (
				/* jshint ignore:start */
				<ContactLink network={link.get('network')} url={link.get('url')}>
					{link.get('url').replace(/^\w*\:\/{0,2}/i, '')}
				</ContactLink>
				/* jshint ignore:end */
			);
		});

		//Render function
		return (
			/* jshint ignore:start */
			<div className="contact-list navbar__dropdown">
				<ContactStatic icon="home">
					{locationStr}
				</ContactStatic>
				{links}
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = ContactListView;