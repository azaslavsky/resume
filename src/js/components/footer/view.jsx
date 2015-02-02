var React = require('react');
var PageSelector = require('./pageSelector');



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
		var pages = window.app.model.get('pages').map(function(page) {
			//https://regex101.com/r/pB7uD7/1
			return (
				/* jshint ignore:start */
				<PageSelector icon={page.get('icon')} name={page.get('name')} selected={page.get('index') === this.state.index} index={page.get('index')} onToggleSelect={this.onSelection} />
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
			<div className={'footer buffer' + animClass + indexClass}>
				{pages}
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = FooterView;