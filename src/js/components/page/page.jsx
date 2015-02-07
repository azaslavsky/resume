var React = require('react');
var PageHeader = require('./header');
var PageCopyright = require('./copyright');



//View definition
module.exports = React.createClass({
	render: function() {
		var pageData = window.app.model.getPage(this.props.name);
		var selectedClass = pageData.get('active') ? ' page--active' : '';
		var nameClass = this.props.name ? ' ' + this.props.name : '';

		return (
			/* jshint ignore:start */
			<div className={'page' + selectedClass + nameClass}>
				<PageHeader text={pageData.get('title')} icon={pageData.get('icon')} />
				<div className="page__content">
					{this.props.children}
				</div>
				<PageCopyright />
			</div>
			/* jshint ignore:end */
		);
	}
});