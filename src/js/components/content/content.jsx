var React = require('react');
var ModelMixin = require('../_mixins/ModelMixin');
var Dispatcher = require('../../dispatcher');

var About = require('./about');
var Experience = require('./experience');
var Skills = require('./skills');
var Projects = require('./projects');



//View definition
module.exports = React.createClass({
	mixins: [ModelMixin()],

	//The percentage of the next page that needs to be visible before it is "activated"
	ratioVisibleToActivate: 0.5,

	getInitialState: function() {
		return {
			windowX: window.innerWidth,
			windowY: window.innerHeight,
		};
	},

	componentDidMount: function() {
		this.handleBodyScroll = _.throttle(this.handleBodyScroll, 250);
		window.addEventListener('scroll', this.handleBodyScroll);
		window.addEventListener('resize', this.handleWindowResize);
	},

	componentWillUnmount: function() {
		window.removeEventListener('scroll', this.handleBodyScroll);
		window.removeEventListener('resize', this.handleWindowResize);
	},

	handleBodyScroll: function(e) {
		//Iterate over child pages, getting the "top" of each
		var scrollHeight = document.getElementsByTagName('body')[0].scrollHeight;
		var cutoff = window.scrollY + Math.round((1 - this.ratioVisibleToActivate) * window.innerHeight);
		var activate = '';

		if (window.scrollY < 0.1 * window.innerHeight) {
			//We're close to the start of the document
			activate = 'about';
		} else if (window.scrollY > scrollHeight - (window.innerHeight * 1.1)) {
			//We're close to the end of the document
			activate = 'projects';
		} else {
			//We're somewhere in the middle
			_.every(this.refs, function(v, i) {
				if (cutoff > v.getDOMNode().offsetTop) {
					activate = i;
					return true;
				}
				return false;
			});
		}

		//Dispatch the event to activate the correct page
		Dispatcher.dispatch({
			actionType: 'scroll',
			page: activate
		});
	},

	handleWindowResize: function(e) {
		//this.setState({windowWidth: window.innerWidth});
	},

	render: function() {
		return (
			/* jshint ignore:start */
			<div className="content">
				<About ref="about" />
				<Experience ref="experience" />
				<Skills ref="skills" />
				<Projects ref="projects" />
			</div>
			/* jshint ignore:end */
		);
	}
});