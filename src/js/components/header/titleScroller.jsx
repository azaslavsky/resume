var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	render: function() {
		var activePage = this.model.get('pages').findWhere({ active: true });
		var activeIndex = activePage ? activePage.get('index') : 0;
		var pageTitles = this.model.get('pages').map(function(page, i) {
			var text = i ? page.get('name') : this.model.getCategory('basics').get('name');

			return (
				/* jshint ignore:start */
				<h1 key={i} className="titleScroller__span navbar__title__heading" style={{transform: 'translateY(' + (-100 * activeIndex) + '%)'}}>{text.charAt(0).toUpperCase() + text.substring(1)}</h1>
				/* jshint ignore:end */
			);
		}.bind(this));

		return (
			/* jshint ignore:start */
			<div className="titleScroller navbar__title__segment">
				{pageTitles}
			</div>
			/* jshint ignore:end */
		);
	}
});