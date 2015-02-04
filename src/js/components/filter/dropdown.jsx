var React = require('react');



//View definition
var DropdownView = React.createClass({
	render: function() {
		return (
			/* jshint ignore:start */
			<div className="filter__dropdown">
				<div className="filter__selected"></div>
			</div>
			/* jshint ignore:end */
		);
	}
});



//Export
module.exports = FilterView;