var React = require('react');
var marked = require('marked');
var _ = require('underscore');
var Page = require('../page/page');



//View definition
module.exports = React.createClass({
	render: function() {
		var summary = [{
			type: 'div',
			attributes: {className: 'page__avatar__placeholder'},
			content: ''
		},{
			type: 'p',
			content: window.app.model.getSummary()
		}];
		var bodyElements = summary.concat(window.app.model.getPage('about', 'body'));

		var body = bodyElements.map(function(element) {
			var attr = _.extend({}, element.attributes || {}, {
				dangerouslySetInnerHTML: {
					//https://regex101.com/r/fA6yM7/1
					__html: marked(element.content || '').replace(/^<p>|<\/*p>\s$/g, '')
				}
			});
			return React.DOM[element.type || 'p'](attr);
		});

		return (
			/* jshint ignore:start */
			<Page name="about">
				<div className="page__avatar">
					<img className="page__avatar__img" src={ window.app.model.getPicture() } />
				</div>
				{body}
			</Page>
			/* jshint ignore:end */
		);
	}
});