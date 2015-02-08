var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Filter = require('../filter/filter');
var Tag = require('../tag/tag');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin, BackboneEventMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('skills');
	},

	parseCollection: function(model, i) {
		return (
			/* jshint ignore:start */
			<Tag model={model} key={i} />
			/* jshint ignore:end */
		);
	},

	makeFilters: function(model) {
		return (
			/* jshint ignore:start */
			<Filter defaultText={model.get('text')} model={model} />
			/* jshint ignore:end */
		);
	},

	render: function() {
		//Make the filters for each section
		var skillFilters = this.model.getFilters('skills').map(this.makeFilters);
		var techFilters = this.model.getFilters('technologies').map(this.makeFilters);

		//Check if a filter is open
		var skillFilterOpened = this.model.getFilters('skills').findWhere({ expanded: true }) ? 10 : 0;
		var techFilterOpened = this.model.getFilters('technologies').findWhere({ expanded: true }) ? 10 : 0;

		return (
			/* jshint ignore:start */
			<Page name="skills">
				<Section heading="Expertise">
					<div className="filters" style={{zIndex: 2 + (skillFilterOpened ? 10 : 0)}}>
						{skillFilters}
					</div>
					<div className="tags">
						{this.model.get('skills').map(this.parseCollection)}
					</div>
				</Section>
				<Section heading="Technologies">
					<div className="filters" style={{zIndex: 1 + (techFilterOpened ? 10 : 0)}}>
						{techFilters}
					</div>
					<div className="tags">
						{this.model.get('technologies').map(this.parseCollection)}
					</div>
				</Section>
			</Page>
			/* jshint ignore:end */
		);
	}
});