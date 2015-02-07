var React = require('react');
var ModelMixin = require('../_mixins/ModelMixin');
var Dispatcher = require('../../dispatcher');
var PageSelector = require('./pageSelector');



//View definition
module.exports = React.createClass({
	mixins: [ModelMixin()],

	getInitialState: function() {
		return {
			index: 0,
			previous: 0
		};
	},

	onSelection: function(index) {
		//Dispatch the event to activate the correct page
		Dispatcher.dispatch({
			actionType: 'scroll',
			page: this.model.get('pages['+ index +'].name'),
			forceScroll: true
		});
	},

	componentWillUpdate: function(){
		var activePage = this.model.get('pages').findWhere({ active: true });
		this.state.previous = this.state.index;
		this.state.index = activePage ? activePage.get('index') : 0;
	},

	render: function() {
		//Create the page selectors
		var diff, animClass = '', indexClass = '';
		var pages = this.model.get('pages').map(function(page) {
			return (
				/* jshint ignore:start */
				<PageSelector key={page.get('index')} icon={page.get('icon')} name={page.get('name')} selected={!!page.get('active')} index={page.get('index')} onToggleSelect={this.onSelection} />
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