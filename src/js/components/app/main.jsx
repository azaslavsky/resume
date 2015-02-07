$ = require('jquery');

var React = require('react');
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');
var InfoMixin = require('../_mixins/infoMixin');
var Dispatcher = require('../../dispatcher');

//Load header, content, and footer
var Header = require('../header/header');
var Content = require('../content/content');
var Footer = require('../footer/footer');



//Render
module.exports = function(){
	var App = React.createClass({
		mixins: [BackboneModelMixin, BackboneEventMixin, InfoMixin],

		getInitialInfo: function(){
			return {
				ratioVisibleToActivate: 0.5, //The percentage of the next page that needs to be visible before it is "activated"
				scrollDuration: 600, //How long the scroll animation lasts
				scrollMutedUntil: 0 //All scroll listeners are ignored until this timestamp is passed
			};
		},

		componentWillMount: function(){
			this.model = window.app.model;
		},

		componentDidMount: function() {
			//Get the initial window sizing - this timeout is a very hacky solution, but it works for now
			_.delay(this.handleWindowResize, 200);

			//Bind window event listeners
			this._handleBodyScroll = _.throttle(this.handleBodyScroll, 250);
			this._handleWindowResize = _.throttle(this.handleWindowResize, 250, {leading: false});
			window.addEventListener('scroll', this._handleBodyScroll);
			window.addEventListener('resize', this._handleWindowResize);
		},

		componentWillUnmount: function() {
			window.removeEventListener('scroll', this._handleBodyScroll);
			window.removeEventListener('resize', this._handleWindowResize);
		},

		handleBodyScroll: function(e) {
			if (!this.info.pages) {
				this.handleWindowResize();
			}

			if ( new Date().getTime() > this.info.scrollMutedUntil ) {
				//Iterate over child pages, getting the "top" of each
				var scrollHeight = document.getElementsByTagName('body')[0].scrollHeight;
				var cutoff = window.scrollY + Math.round((1 - this.info.ratioVisibleToActivate) * window.innerHeight);
				var activate = '';

				if (window.scrollY < 0.1 * window.innerHeight) {
					//We're close to the start of the document
					activate = 'about';
				} else if (window.scrollY > scrollHeight - (window.innerHeight * 1.1)) {
					//We're close to the end of the document
					activate = 'projects';
				} else {
					//We're somewhere in the middle
					_.every(this.refs.content.getPages(), function(v, i) {
						if (cutoff > this.info.pages[v.model.get('name')].top) {
							activate = v.model.get('name');
							return true;
						}
						return false;
					}, this);
				}

				//Dispatch the event to activate the correct page
				Dispatcher.dispatch({
					actionType: 'scroll',
					page: activate
				});
			}
		},

		//When resizing the window, make a note of its resulting height and the positions of all the pages
		handleWindowResize: function(e) {
			var positionData = {
				winHeight: window.innerHeight,
				winWidth: window.innerWidth,
				pages: {}
			};

			//Find the position of each page
			_.each(this.refs.content.getPages(), function(v, i) {
				var thisPageNode = v.getDOMNode();
				positionData.pages[v.model.get('name')] = {
					top: thisPageNode.offsetTop,
					left: thisPageNode.offsetLeft,
					height: thisPageNode.offsetHeight,
					width: thisPageNode.offsetWidth
				};
			});

			console.log(positionData);
			this.setInfo(positionData);
		},

		//If we are forcing a scroll, make sure to mute for the 
		beforeForceUpdate: function(data) {
			if (data && data.forceScroll) {
				this.setInfo({
					scrollMutedUntil: new Date().getTime() + this.info.scrollDuration
				});
			}
		},

		//After we have updated the model, if a forced scroll is desired, go ahead and execute it
		afterForceUpdate: function(data) {
			if (data && data.forceScroll) {
				var activePage = this.model.get('pages').findWhere({active: true});
				var pageOffset = this.info.pages[activePage ? activePage.get('name') : this.model.get('pages[0].name')];
				//console.log(activePage ? activePage.get('name') : this.model.get('pages[0].name'));
				//console.log(this.info.pages[activePage ? activePage.get('name') : this.model.get('pages[0].name')].top);
				$('html, body').animate({ scrollTop: pageOffset.top - 60 });
			}
		},

		render: function() {
			return (
				/* jshint ignore:start */
				<div className="main">
					<Header ref="header" key="header" model={this.model} />
					<Content ref="content" key="content" model={this.model} scrollMutedUntil={this.info.scrollMutedUntil} />
					<Footer ref="footer" key="footer" model={this.model} />
				</div>
				/* jshint ignore:end */
			);
		}
	});

	React.render(
		/* jshint ignore:start */
		<App />, 
		/* jshint ignore:end */
		document.getElementsByTagName('body')[0]
	);
};