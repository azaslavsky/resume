var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({
	mixins: [BackboneModelMixin],

	//Get a camel-cased version of the image name
	imgName: function(name) {
		var words = name.trim().replace(/[,.:]/g, '').split(/[\s-_]/);
		var wordCount = words.length;

		if (words.length === 1) {
			return words[0].toLowerCase();
		}

		//If the first word is all upper case, leave it alone; in all other cases, camelCase that sucker!
		if (words[0] !== words[0].toUpperCase()) {
			words[0] = words[0].charAt(0).toLowerCase() + words[0].substring(1);
		}

		//camelCase the remaining words
		for (var i = wordCount - 1; i > 0 ; i--) {
			if (words[i].length) {
				words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
			} else {
				words.splce(i);
			}
		}
		return words.join('');
	},

	handleDetailClose: function(e){
		this.props.onDetailClose(e);
	},

	render: function() {
		var detailOpenedClass = this.model.get('expanded') ? ' detail--opened' : '';

		return (
			/* jshint ignore:start */
			<div className={'detail' + detailOpenedClass} style={{ marginLeft: this.props.offset || 'auto'}}>
				<div className="detail__avatar">
				<img className="detail__img" src={'./img/' + this.imgName(this.model.get('name')) + '.svg'} />
				</div>
				<div className="detail__header">
					<h4>{this.props.heading}</h4>
					<span className="detail__close" onClick={this.handleDetailClose} />
				</div>
				<table className="detail__content">
					<tbody>
						<tr className="detail__row">
							<td className="detail__cell detail__cell__title">Skill Level</td>
							<td className="detail__cell detail__cell__info">{this.model.get('level')}</td>
						</tr>
					</tbody>
				</table>
			</div>
			/* jshint ignore:end */
		);
	}
});