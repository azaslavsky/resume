var React = require('react');
var ModelMixin = require('../modelMixin');
var Dispatcher = require('../../dispatcher');



//View definition
var FilterView = React.createClass({
	mixins: [ModelMixin()],

	handleToggleExpand: function(active){
		Dispatcher.dispatch({
			actionType: this.props.model.get('expanded') ? 'filter-close' : 'filter-expand',
			expandedModel: this.model
		});
	},

	handleFilterSelection: function(selected){
		Dispatcher.dispatch({
			actionType: 'filter-select',
			expandedModel: this.model,
			section: this.model.get('section'),
			filterType: this.model.get('type'),
			selectedValue: selected
		});
	},

	render: function() {
		var expandedClass = this.model.get('expanded') ? ' filter--expanded' : '';
		var activeClass = this.model.get('active') ? ' filter--active' : '';
		var options = this.model.get('options').map(function(item, i) {
			return (
				/* jshint ignore:start */
				<li className="filter__option" onClick={this.handleFilterSelection.bind(null, item)} index={i}>
					{item}
				</li>
				/* jshint ignore:end */
			);
		}.bind(this));

		return (
			/* jshint ignore:start */
			<div className={'filter' + activeClass + expandedClass}>
				<div className="filter__display" onClick={this.handleToggleExpand}>
					<span className="filter__text">{ this.model.get('active') || this.props.defaultText }</span>
					<span className="filter__arrow" />
				</div>
				<ul className="filter__dropdown">
					<li className="filter__option filter__default" onClick={this.handleFilterSelection.bind(null, false)}>
						{this.props.defaultText}
					</li>
					{options}
				</ul>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = FilterView;