var React = require('react');
var Page = require('../page/page');
var Section = require('../page/section');
var Filter = require('../filter/filter');
var Tag = require('../tag/tag');



//View definition
var SkillsView = React.createClass({
	parseCollection: function(item){
		return (
			/* jshint ignore:start */
			<Tag data={item.attributes}>
			</Tag>
			/* jshint ignore:end */
		);
	},

	makeFilters: function(filter){
		return (
			/* jshint ignore:start */
			<Filter defaultText={filter.text} options={filter.options} />
			/* jshint ignore:end */
		);
	},

	render: function() {
		//Make the filters for each section
		var skillFilters = window.app.model.getFilter('skills').map(this.makeFilters);
		var techFilters = window.app.model.getFilter('technologies').map(this.makeFilters);

		return (
			/* jshint ignore:start */
			<Page name="skills">
				<Section heading="Expertise">
					<div className="filters" style={{zIndex: 2}}>
						{skillFilters}
					</div>
					<div className="tags">
						{window.app.model.getCategory('skills').map(this.parseCollection)}
					</div>
				</Section>
				<Section heading="Technologies">
					<div className="filters" style={{zIndex: 1}}>
						{techFilters}
					</div>
					<div className="tags">
						{ window.app.model.getCategory('technologies').map(this.parseCollection) }
					</div>
				</Section>
			</Page>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = SkillsView;