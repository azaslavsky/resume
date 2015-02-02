var React = require('react');
var PageSelector = require('./pageSelector');



//Selector specfiication
var selectorSpec = [
	{ index: 0, section: 'about', icon: 'user'},
	{ index: 1, section: 'experience', icon: 'briefcase'},
	{ index: 2, section: 'projects', icon: 'bulb'},
	{ index: 3, section: 'skills', icon: 'tools'}
];



//View definition
var FooterView = React.createClass({
	getInitialState: function() {
		return {
			index: 0,
			previous: 0
		};
	},

	onSelection: function(index) {
		this.setState({index: index, previous: this.state.index});
	},

	render: function() {
		//Create the page selectors
		var diff, animClass = '', indexClass = '';
		var selectors = selectorSpec.map(function(selector) {
			//https://regex101.com/r/pB7uD7/1
			return (
				/* jshint ignore:start */
				<PageSelector icon={selector.icon} section={selector.section} selected={selector.index === this.state.index} index={selector.index} onToggleSelect={this.onSelection} />
				/* jshint ignore:end */
			);
		}.bind(this));

		//Calculate a class for the transition animation
		diff = this.state.index - this.state.previous;
		if (diff > 0) {
			animClass = ' footer--anim-right-' + Math.abs(diff).toString();
		} else if (diff < 0) {
			animClass = ' footer--anim-left-' + Math.abs(diff).toString();
		}

		//Set an index class
		indexClass = ' footer--index-' + this.state.index.toString();

		return (
			/* jshint ignore:start */
			<div className={'footer container buffer' + animClass + indexClass}>
				{selectors}
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = FooterView;