var React = require('react');



//View definition
var TagView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<span className="tag">
				<span className="tag__text">{this.props.data.name}</span>
				<span className="tag__more" />
			</span>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = TagView;