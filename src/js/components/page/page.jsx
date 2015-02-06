var React = require('react');
var PageHeader = require('./header');



//View definition
var PageView = React.createClass({
	render: function() {
		var pageData = window.app.model.getPage(this.props.name);
		var selectedClass = pageData.get('selected') ? ' page--active' : '';
		var nameClass = this.props.name ? ' ' + this.props.name : '';

		return (
			/* jshint ignore:start */
			<div className={'page page--active' + selectedClass + nameClass}>
				<PageHeader text={pageData.get('title')} icon={pageData.get('icon')} />
				<div className="page__content">
					{this.props.children}
				</div>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = PageView;