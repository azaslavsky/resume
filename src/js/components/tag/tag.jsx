var React = require('react');
var ModelMixin = require('../modelMixin');
var Dispatcher = require('../../dispatcher');
var Detail = require('../detail/detail');



//View definition
var TagView = React.createClass({
	mixins: [ModelMixin(true)],

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
	renderDetails: function(expanded) {
		if (expanded) {
			return (
				/* jshint ignore:start */
					<Detail heading={this.model.get('name')} model={this.model} onDetailClose={this.handleToggleExpand} />
				/* jshint ignore:end */
			);
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



//Export
module.exports = TagView;