var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');
var Dispatcher = require('../../dispatcher');

var Detail = require('../detail/detail');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin, BackboneEventMixin],

	//We need a state AND a model to make sure re-rendering flows properly when a detail is open
	getInitialState: function() {
		return {
			offset: 0
		};
	},

	handleToggleExpand: function(e){
		//this.setState({expanded: !this.model.get('expanded')});
		Dispatcher.dispatch({
			actionType: this.model.get('expanded') ? 'tag-close' : 'tag-expand',
			expandedModel: this.model
		});

		//Make sure that a "close" event from the Detail doesn't trigger a second toggleExpand!
		e.stopPropagation();
	},

	//Render a details card if this tag has been expanded
	renderDetails: function(expanded, offset) {
		if (expanded) {
			return (
				/* jshint ignore:start */
					<Detail heading={this.model.get('name')} model={this.model} onDetailClose={this.handleToggleExpand} offset={this.state.offset} />
				/* jshint ignore:end */
			);
		}
	},

	//Whenever we render this guy, make sure to save the position and offset
	componentDidUpdate: function() {
		if ( this.model.get('expanded') ) {
			this.calculateOffset();
		}
	},

	//When we first render this guy, make sure to save the position and offset
	componentDidMount: function() {
		if ( this.model.get('expanded') ) {
			this.calculateOffset();
		}
	},

	//When rendering, make sure that the detail area is always on-screen
	calculateOffset: function() {
		var offset;
		var detailWidth;
		var entryWidth;
		var diff;
		var newOffset = null;
		var node = this.getDOMNode();

		//Are we on a mobile or "widescreen" (aka, 768px or wider) device?  The corresponding values match those specified in the details SCSS file
		detailWidth = window.innerWidth <= 768 ? 260 : 400;
		entryWidth = window.innerWidth <= 768 ? window.innerWidth - 40 : (window.innerWidth > 944 ? 854 : window.innerWidth - 100);

		//Get the position of the left edge relative to the left boundary
		offset = node.offsetLeft + (node.offsetWidth/2);
		diff = offset - (detailWidth/2);

		//Figure out how much we need to adjust the offset by
		if (diff < 0) {
			newOffset = -1 * diff;
		} else if (offset + detailWidth > entryWidth) {
			newOffset = entryWidth - (offset + detailWidth/2) - 16;
		}

		if (newOffset !== this.state.offset) {
			this.setState({ offset: newOffset });
		}
	},

	render: function() {
		var expandedClass = this.model.get('expanded') ? ' tag--expanded' : '';
		var hiddenClass = this.model.get('hidden') ? ' tag--hidden' : '';
		var details = this.renderDetails( this.model.get('expanded') );

		return (
			/* jshint ignore:start */
			<span className={'tag' + expandedClass + hiddenClass} onClick={this.handleToggleExpand}>
				<span className="tag__text">{this.model.get('name')}</span>
				<span className="tag__more" />
				{ details || undefined }
			</span>
			/* jshint ignore:end */
		);
	}
});