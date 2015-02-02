var React = require('react');



//View definition
var PageSelectorView = React.createClass({
	getInitialState: function() {
		return {};
	},

	getDefaultProps: function() {
		return {
			selected: false
		};
	},

	handleSelectionToggle: function(e) {
		if (this.props.onToggleSelect) {
			this.props.onToggleSelect( this.props.index );
		} else {
			this.setState({ selected: !this.props.selected });
		}
	},

	render: function() {
		var isSelected = typeof this.state.selected === 'boolean' ? this.state.selected : this.props.selected;
		var selectedClass = isSelected ? ' footer__selector--selected' : '';

		return (
			/* jshint ignore:start */
			<div className={'footer__selector' + selectedClass} key={this.props.index} section={this.props.section} onClick={this.handleSelectionToggle}>
				<span className={'footer__icon icon-' + this.props.icon} />
				<span className="footer__text">{ this.props.section.charAt(0).toUpperCase() + this.props.section.substring(1) }</span>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = PageSelectorView;