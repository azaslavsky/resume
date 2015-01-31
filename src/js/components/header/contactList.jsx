var React = require('react');
var ContactStatic = require('./contactStatic');
//var ContactLink = require('./contactLink');



//View definition
var ContactListView = React.createClass({
	render: function() {
		var location = window.app.model.get('basics.location');
		var locationStr = location.get('city') +', '+ location.get('region') +', '+ location.get('countryCode') +', '+ location.get('postalCode');
		return (
			/* jshint ignore:start */
			<div className="contactList navbar__dropdown">
				<ContactStatic icon="home">
					{locationStr}
				</ContactStatic>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = ContactListView;