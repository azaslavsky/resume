var React = require('react');



//View definition
var FilterView = React.createClass({
	getInitialState: function(){
		this.options = this.props.options || [];
		return {
			expanded: false,
			active: this.props.active || false
		};
	},

	handleToggleExpand: function(e){
		this.setState({expanded: !this.state.expanded});
	},

	handleFilterSelection: function(item){
		this.setState({active: item});
		this.handleToggleExpand();
	},

	render: function() {
		var expandedClass = this.state.expanded ? ' filter--expanded' : '';
		var activeClass = this.state.active ? ' filter--active' : '';
		var options = this.props.options.map(function(item, i) {
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
					<span className="filter__text">{ this.state.active || this.props.defaultText }</span>
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