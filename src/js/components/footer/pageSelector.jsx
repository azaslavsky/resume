var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	getDefaultProps: function() {
		return {
			active: false
		};
	},

	handleSelectionToggle: function(e) {
		this.props.onToggleSelect && this.props.onToggleSelect( this.props.index );
	},

	render: function() {
		var selectedClass = this.model.get('active') ? ' footer__selector--selected' : '';

		return (
			/* jshint ignore:start */
			<div className={'footer__selector' + selectedClass} key={this.model.get('index')} name={this.model.get('name')} onClick={this.handleSelectionToggle}>
				<span className={'footer__icon icon-' + this.model.get('icon')} />
				<span className="footer__text">{ this.model.get('name').charAt(0).toUpperCase() + this.model.get('name').substring(1) }</span>
			</div>
			/* jshint ignore:end */
		);
	}
});