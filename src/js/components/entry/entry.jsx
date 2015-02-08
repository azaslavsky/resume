var React = require('react');



//View definition
module.exports = React.createClass({
	renderMajorHeader: function() {
		if (this.props.website) {
			return (
				/* jshint ignore:start */
				<a href={this.props.website} target="_blank">{this.props.majorHeader}</a>
				/* jshint ignore:end */
			);
		}
		return this.props.majorHeader;
	},

	renderMinorHeader: function() {
		if (this.props.minorHeader) {
			return (
				/* jshint ignore:start */
				<span className="entry__heading__minor">{this.props.minorHeader}</span>
				/* jshint ignore:end */
			);
		}
		return undefined;
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<div className="entry">
				<h4 className="entry__heading">
					<span className="entry__heading__major">{this.renderMajorHeader()}</span>
					{this.renderMinorHeader()}
				</h4>
				<div className="entry__content">
					{this.props.children}
				</div>
			</div>
			/* jshint ignore:end */
		);
	}
});