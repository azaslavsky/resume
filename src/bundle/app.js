(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')


},{"./lib/Dispatcher":2}],2:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;


},{"./invariant":3}],3:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;


},{}],4:[function(require,module,exports){

module.exports = [
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'en',
  'for',
  'from',
  'how',
  'if',
  'in',
  'neither',
  'nor',
  'of',
  'on',
  'only',
  'onto',
  'out',
  'or',
  'per',
  'so',
  'than',
  'that',
  'the',
  'to',
  'until',
  'up',
  'upon',
  'v',
  'v.',
  'versus',
  'vs',
  'vs.',
  'via',
  'when',
  'with',
  'without',
  'yet'
];

},{}],5:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);



var ActionManager = function(manifest, actions) {
	this.manifest = manifest;
	_.extend(this, actions);
};



ActionManager.prototype.execute = function(payload, model) {
	if ( typeof payload === 'object' && payload.actionType && this.manifest && this.manifest[payload.actionType] && typeof this[this.manifest[payload.actionType]] === 'function') {
		this[this.manifest[payload.actionType]](payload, model);
	} else {
		//throw('You did not supply a payload formatted appropriately for the action you tried to execute!');
	}
};



ActionManager.prototype.create = function() {
	return this.execute.bind(this);
};



module.exports = ActionManager;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
var ActionManager = require('./actions');



//A manifest that pairs actionTypes with their respective methods in this instance of ActionManager
var manifest = {
	'header-toggle': 'headerToggle',
	'scroll': 'scroll'
};



//All actions are executed in the context of the supplied model, if one is provided
var GlobalActions = new ActionManager(manifest, {
	//Toggle the state of the header: contact list open, search open, or everything closed
	headerToggle: function(data, model) {
		model.set({
			contacts: data.expand === 'contacts' ? true : false
			//search: data.expand === 'search' ? true : false
		});
	},

	//Respond to scroll adjustment events
	scroll: function(data, model) {
		var renderOptions;

		model.get('pages').each(function(page){
			page.set('active', data.page === page.get('name') ? true : false, {silent: true});
		});

		//If the forceScroll data option is true, we want to scroll the app as well
		if (data.forceScroll) {
			renderOptions = {
				forceScroll: true
			};
		}

		//Emit the change event, but keep it shallow
		model.trigger('change', renderOptions);
	}
});



module.exports = GlobalActions.create();

},{"./actions":5}],7:[function(require,module,exports){
var ActionManager = require('./actions');



//A manifest that pairs actionTypes with their respective methods in this instance of ActionManager
var manifest = {
	'tag-expand': 'tagExpand',
	'tag-close': 'tagClose',
	'filter-expand': 'filterExpand',
	'filter-close': 'filterClose',
	'filter-select': 'filterSelect'
};



//All actions are executed in the context of the supplied model, if one is provided
var SkillsActions = new ActionManager(manifest, {
	//Merge multiple Backbone collections
	_mergeCollections: function() {
		//Convert each colletion to an array
		var collections = Array.prototype.map.call(arguments, function(v) {
			return v.toArray();
		});

		//Merge the collections into one giant array
		return _.union.apply(null, collections);
	},

	//Shorthand for merging the filters for skills and technologies
	_mergeFilters: function(model) {
		return this._mergeCollections(model.getFilters('skills'), model.getFilters('technologies'));
	},

	//Shorthand for merging skills and technologies tag lists
	_mergeSections: function(model) {
		return this._mergeCollections(model.get('skills'), model.get('technologies'));
	},

	//A tag has been expanded - make sure to close every other tag!
	tagExpand: function(data, model) {
		this._mergeSections(model).forEach(function(v) {
			if (v === data.expandedModel) {
				v.set('expanded', true);
			} else {
				v.set('expanded', false);
			}
		});
	},

	//Close every single tag
	tagClose: function(data, model) {
		this._mergeSections(model).forEach(function(v) {
			v.set('expanded', false);
		});
	},

	//Opened the filter dropdown
	filterExpand: function(data, model) {
		this._mergeFilters(model).forEach(function(v) {
			if (v === data.expandedModel) {
				v.set('expanded', true, {silent: true});
			} else {
				v.set('expanded', false, {silent: true});
			}
		});

		//Emit the change event to trigger the forced rendering of the entire secton
		model.trigger('change');
	},

	//Closed the filter dropdown
	filterClose: function(data, model) {
		this._mergeFilters(model).forEach(function(v) {
			v.set('expanded', false, {silent: true});
		});

		//Emit the change event
		model.trigger('change');
	},

	//Selected a new filter from the dropdown
	filterSelect: function(data, model) {
		//Update the active filter, but do it silently to prevent double rendering
		data.expandedModel.set('active', data.selectedValue, {silent: true});

		//Apply the selected filter to all of the tags in the relevant section
		var sectionTags = model.get(data.section);
		var sectionFilters = model.getFilters(data.section);
		var loops = 0;

		sectionTags.forEach(function(tag) {
			var isHidden = false;

			sectionFilters.forEach(function(filter){
				if (!isHidden) {
					var activeValue = filter.get('active');
					if (activeValue) {
						var filteredProp = tag.get(filter.get('type'));
						if (filteredProp === activeValue || (filteredProp instanceof Array && filteredProp.indexOf(activeValue) > -1) ) {
							return;
						}
					} else {
						return;
					}
				}
				isHidden = true;
			});

			tag.set('hidden', isHidden, {silent: true});
		});

		//Close all the filter fields
		this.filterClose(data, model);
	},
});



module.exports = SkillsActions.create();

},{"./actions":5}],8:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);



//For "actionable" controller-type React components, there needs to be a way for the component to listen to it's model for events; enter this mixin...
//This mixin can only be used if BackboneModelMixin is loaded first!
module.exports = {
	componentDidMount: function() {
		this.updateInfo && this.updateInfo();
		this.model && this.model.on('change sync reset', this.doForceUpdate, this);
	},

	componentWillUnmount: function() {
		this.model && this.model.off('change sync reset', this.doForceUpdate, this);
	},

	doForceUpdate: function(data) {
		this.beforeForceUpdate && this.beforeForceUpdate(data);
		this.forceUpdate();
		this.afterForceUpdate && this.afterForceUpdate(data);
	}
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);



//A mixin that allows common model binding functionality to be added to our React Components, so that they play a little nicer with Backbone
module.exports = {
	//Bind the model, if one exists; otherwise, just use the props
	componentBindModel: function() {
		if (this.props.model) {
			this.model = this.props.model;
		} else {
			//Use "this.model" as an interface for the component's props
			this.model = {
				attributes: this.props,
				get: function(prop){
					return this.props[prop];
				}
			};
		}
	},

	//Bind the model when mounting the component
	componentWillMount: function() {
		this.componentBindModel();
	}
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);



//A mixin that allows React components to have an "info" store, which tracks all non-render prompting state information
module.exports = {
	//Apply changes to the info store; same API as "setState"
	setInfo: function(hashmap) {
		_.each(hashmap, function(v, i) {
			this.info[i] = v;
		}, this);
	},

	//After a component has updated, make sure to update the info as well
	componentDidUpdate: function() {
		this.updateInfo && this.updateInfo();
	},

	//After a component has updated, make sure to update the info as well
	componentDidMount: function() {
		this.updateInfo && this.updateInfo();
	},

	//Set an empty info object if the getInitialInfo method isn't defined
	componentWillMount: function() {
		this.info = (this.getInitialInfo && this.getInitialInfo()) || {};
	}
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
var marked = (typeof window !== "undefined" ? window.marked : typeof global !== "undefined" ? global.marked : null);
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('about');
	},

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
			React.createElement(Page, {name: "about"}, 
				React.createElement("div", {className: "page__avatar"}, 
					React.createElement("img", {className: "page__avatar__img", src:  window.app.model.getPicture() })
				), 
				body
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"../page/page":34}],12:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var About = require('./about');
var Experience = require('./experience');
var Skills = require('./skills');
var Projects = require('./projects');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	//Interface that allows parent components to easily loop through the pages
	getPages: function() {
		return [
			this.refs.about,
			this.refs.experience,
			this.refs.skills,
			this.refs.projects,
		];
	},

	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "content"}, 
				React.createElement(About, {ref: "about", key: 0}), 
				React.createElement(Experience, {ref: "experience", key: 1}), 
				React.createElement(Skills, {ref: "skills", key: 2}), 
				React.createElement(Projects, {ref: "projects", key: 3})
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"./about":11,"./experience":13,"./projects":14,"./skills":15}],13:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Job = require('../entry/job');
var School = require('../entry/school');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('experience');
	},

	renderJobs: function(job, i) {
		return (
			/* jshint ignore:start */
			React.createElement(Job, {key: i, model: job})
			/* jshint ignore:end */
		);
	},

	renderSchools: function(school, i) {
		return (
			/* jshint ignore:start */
			React.createElement(School, {key: i, model: school})
			/* jshint ignore:end */
		);
	},

	renderSection: function(modelName, sectionHeading, iteratee) {
		//Do we have any data for this section (I sure hope so...)?  If not, return undefined
		if (!this.model.get(modelName).length) {
			return undefined;
		}

		//Loop through the entries
		var entries = this.model.get(modelName).map(iteratee);

		return (
			/* jshint ignore:start */
			React.createElement(Section, {heading: sectionHeading}, 
				entries
			)
			/* jshint ignore:end */
		);
	},

	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement(Page, {name: "experience"}, 
				 this.renderSection('education', 'Education', this.renderSchools), 
				 this.renderSection('work', 'Work', this.renderJobs) 
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"../entry/job":18,"../entry/school":20,"../page/page":34,"../page/section":35}],14:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Project = require('../entry/project');
var Volunteer = require('../entry/volunteer');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('projects');
	},

	renderProjects: function(project, i) {
		return (
			/* jshint ignore:start */
			React.createElement(Project, {key: i, model: project})
			/* jshint ignore:end */
		);
	},

	renderVolunteering: function(volunteer, i) {
		return (
			/* jshint ignore:start */
			React.createElement(Volunteer, {key: i, model: volunteer})
			/* jshint ignore:end */
		);
	},

	renderInterests: function() {
		return (
			/* jshint ignore:start */
			React.createElement(Section, {heading: "Recreational"}, 
				React.createElement("p", null, 
					this.model.get('interests').pluck('name').join(', ')
				)
			)
			/* jshint ignore:end */
		);
	},

	renderSection: function(modelName, sectionHeading, iteratee) {
		//Do we have any data for this section (I sure hope so...)?  If not, return undefined
		if (!this.model.get(modelName).length) {
			return undefined;
		}

		//Loop through the entries
		var entries = this.model.get(modelName).map(iteratee);

		return (
			/* jshint ignore:start */
			React.createElement(Section, {heading: sectionHeading}, 
				entries
			)
			/* jshint ignore:end */
		);
	},

	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement(Page, {name: "projects"}, 
				 this.renderInterests('interests'), 
				 this.renderSection('projects', 'Coding', this.renderProjects), 
				 this.renderSection('volunteering', 'Volunteering', this.renderVolunteering) 
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"../entry/project":19,"../entry/volunteer":21,"../page/page":34,"../page/section":35}],15:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');

var Page = require('../page/page');
var Section = require('../page/section');
var Filter = require('../filter/filter');
var Tag = require('../tag/tag');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin, BackboneEventMixin],

	componentWillMount: function() {
		this.model = window.app.model.getPage('skills');
	},

	parseCollection: function(model, i) {
		return (
			/* jshint ignore:start */
			React.createElement(Tag, {model: model, key: i})
			/* jshint ignore:end */
		);
	},

	makeFilters: function(model, i) {
		return (
			/* jshint ignore:start */
			React.createElement(Filter, {defaultText: model.get('text'), model: model, key: i, index: i})
			/* jshint ignore:end */
		);
	},

	render: function() {
		//Make the filters for each section
		var skillFilters = this.model.getFilters('skills').map(this.makeFilters);
		var techFilters = this.model.getFilters('technologies').map(this.makeFilters);

		//Check if a filter is open
		var skillFilterOpened = this.model.getFilters('skills').findWhere({ expanded: true }) ? 10 : 0;
		var techFilterOpened = this.model.getFilters('technologies').findWhere({ expanded: true }) ? 10 : 0;

		return (
			/* jshint ignore:start */
			React.createElement(Page, {name: "skills"}, 
				React.createElement(Section, {heading: "Expertise"}, 
					React.createElement("div", {className: "filters", style: {zIndex: 2 + (skillFilterOpened ? 10 : 0)}}, 
						skillFilters
					), 
					React.createElement("div", {className: "tags"}, 
						this.model.get('skills').map(this.parseCollection)
					)
				), 
				React.createElement(Section, {heading: "Technologies"}, 
					React.createElement("div", {className: "filters", style: {zIndex: 1 + (techFilterOpened ? 10 : 0)}}, 
						techFilters
					), 
					React.createElement("div", {className: "tags"}, 
						this.model.get('technologies').map(this.parseCollection)
					)
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneEventMixin":8,"../_mixins/backboneModelMixin":9,"../filter/filter":22,"../page/page":34,"../page/section":35,"../tag/tag":36}],16:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({displayName: "exports",
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
			React.createElement("div", {className: 'detail' + detailOpenedClass, style: { marginLeft: this.props.offset || 'auto'}}, 
				React.createElement("div", {className: "detail__avatar"}, 
				React.createElement("img", {className: "detail__img", src: './img/' + this.imgName(this.model.get('name')) + '.svg'})
				), 
				React.createElement("div", {className: "detail__header"}, 
					React.createElement("h4", null, this.props.heading), 
					React.createElement("span", {className: "detail__close", onClick: this.handleDetailClose})
				), 
				React.createElement("table", {className: "detail__content"}, 
					React.createElement("tbody", null, 
						React.createElement("tr", {className: "detail__row"}, 
							React.createElement("td", {className: "detail__cell detail__cell__title"}, "Skill Level"), 
							React.createElement("td", {className: "detail__cell detail__cell__info"}, this.model.get('level'))
						)
					)
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9}],17:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	renderMajorHeader: function() {
		if (this.props.website) {
			return (
				/* jshint ignore:start */
				React.createElement("a", {href: this.props.website, target: "_blank"}, this.props.majorHeader)
				/* jshint ignore:end */
			);
		}
		return this.props.majorHeader;
	},

	renderMinorHeader: function() {
		if (this.props.minorHeader) {
			return (
				/* jshint ignore:start */
				React.createElement("span", {className: "entry__heading__minor"}, this.props.minorHeader)
				/* jshint ignore:end */
			);
		}
		return undefined;
	},

	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "entry"}, 
				React.createElement("h4", {className: "entry__heading"}, 
					React.createElement("span", {className: "entry__heading__major"}, this.renderMajorHeader()), 
					this.renderMinorHeader()
				), 
				React.createElement("div", {className: "entry__content"}, 
					this.props.children
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	render: function() {
		var date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		startParts = this.model.get('startDate').split('-');
		start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';
		if (this.model.get('endDate')) {
			endParts = this.model.get('endDate').split('-');
			end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
		}
		date = start + (end ? ' - ' + end : '');

		return (
			/* jshint ignore:start */
			React.createElement(Entry, {majorHeader: this.model.get('company'), minorHeader: ' | ' + this.model.get('position') + ' | ' + date, website: this.model.get('website')}, 
				React.createElement("p", null, 
					this.model.get('summary')
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"./entry":17}],19:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin, BackboneEventMixin],

	renderGithubStars: function(){
		return (
			/* jshint ignore:start */
			React.createElement("span", {className: "entry__heading__stats"}, 
				React.createElement("span", {className: "entry__heading__icon icon-star"}), 
				React.createElement("span", {className: "entry__heading__stat"},  typeof this.model.get('stars') === 'number' ? this.model.get('stars') : '-'), 
				React.createElement("span", {className: "entry__heading__icon icon-fork"}), 
				React.createElement("span", {className: "entry__heading__stat"},  typeof this.model.get('forks') === 'number' ? this.model.get('forks') : '-')
			)
			/* jshint ignore:end */
		);
	},

	render: function() {
		var minorHeader, github, date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		if (this.model.get('startDate')) {
			startParts = this.model.get('startDate').split('-');
			if (start.length) {
				start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';

				if (this.model.get('endDate')) {
					endParts = this.model.get('endDate').split('-');
					end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
				}
			}

			date = start + (end ? ' - ' + end : '');
		}

		if (typeof this.model.get('website') === 'string' && this.model.get('website').match(/:\/\/github\.com\/(?:\w*)\/(?:\w*)/i)) {
			//This is a github repo!  Query the Github API to get its stars and forks
			github = this.renderGithubStars();
		}

		if (date || github) {
			minorHeader = function(){
				return (
					/* jshint ignore:start */
					React.createElement("span", null, date, github)
					/* jshint ignore:end */
				);
			}();
		}

		return (
			/* jshint ignore:start */
			React.createElement(Entry, {majorHeader: this.model.get('name'), minorHeader: minorHeader, website: this.model.get('website')}, 
				React.createElement("p", null, 
					this.model.get('summary')
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneEventMixin":8,"../_mixins/backboneModelMixin":9,"./entry":17}],20:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	render: function() {
		var degree, date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		if (this.model.get('studyType') && this.model.get('studyType')) {
			degree = this.model.get('studyType') + ', ' + this.model.get('area');
		} else if (!this.model.get('studyType')) {
			degree = this.model.get('area');
		} else if (!this.model.get('area')) {
			degree = this.model.get('studyType');
		}

		startParts = this.model.get('startDate').split('-');
		start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';
		if (this.model.get('endDate')) {
			endParts = this.model.get('endDate').split('-');
			end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
		}
		date = start + (end ? ' - ' + end : '');

		return (
			/* jshint ignore:start */
			React.createElement(Entry, {majorHeader: this.model.get('institution'), minorHeader: ' | ' + (degree ? degree + ' | ' : '') + date}, 
				React.createElement("p", null, 
					'GPA: ' + this.model.get('gpa')
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"./entry":17}],21:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');

var Entry = require('./entry');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	render: function() {
		var date, startParts, endParts, start, end, months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

		startParts = this.model.get('startDate').split('-');
		start = months[startParts[1] - 1] + ' ' + startParts[0].substring(2) + '\'';
		if (this.model.get('endDate')) {
			endParts = this.model.get('endDate').split('-');
			end = months[endParts[1] - 1] + ' ' + endParts[0].substring(2) + '\'';
		}
		date = start + (end ? ' - ' + end : '');

		return (
			/* jshint ignore:start */
			React.createElement(Entry, {majorHeader: this.model.get('organization'), minorHeader: ' | ' + this.model.get('position') + ' | ' + date, website: this.model.get('website')}, 
				React.createElement("p", null, 
					this.model.get('summary')
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9,"./entry":17}],22:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var Dispatcher = require('../../dispatcher');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	handleToggleExpand: function(active){
		Dispatcher.dispatch({
			actionType: this.props.model.get('expanded') ? 'filter-close' : 'filter-expand',
			expandedModel: this.model
		});
	},

	handleFilterSelection: function(selected){
		Dispatcher.dispatch({
			actionType: 'filter-select',
			expandedModel: this.model,
			section: this.model.get('section'),
			filterType: this.model.get('type'),
			selectedValue: selected
		});
	},

	render: function() {
		var expandedClass = this.model.get('expanded') ? ' filter--expanded' : '';
		var activeClass = this.model.get('active') ? ' filter--active' : '';
		var options = this.model.get('options').map(function(item, i) {
			return (
				/* jshint ignore:start */
				React.createElement("li", {className: "filter__option", onClick: this.handleFilterSelection.bind(null, item), index: i}, 
					item
				)
				/* jshint ignore:end */
			);
		}.bind(this));

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'filter' + activeClass + expandedClass, style: { zIndex: 100 - this.props.index}}, 
				React.createElement("div", {className: "filter__display", onClick: this.handleToggleExpand}, 
					React.createElement("span", {className: "filter__text"},  this.model.get('active') || this.props.defaultText), 
					React.createElement("span", {className: "filter__arrow"})
				), 
				React.createElement("ul", {className: "filter__dropdown"}, 
					React.createElement("li", {className: "filter__option filter__default", onClick: this.handleFilterSelection.bind(null, false)}, 
						this.props.defaultText
					), 
					options
				)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dispatcher":37,"../_mixins/backboneModelMixin":9}],23:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var InfoMixin = require('../_mixins/infoMixin');
var Dispatcher = require('../../dispatcher');
var PageSelector = require('./pageSelector');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin, InfoMixin],

	getInitialInfo: function() {
		return {
			index: 0,
			previous: 0
		};
	},

	onSelection: function(index) {
		//Dispatch the event to activate the correct page
		Dispatcher.dispatch({
			actionType: 'scroll',
			page: this.model.get('pages['+ index +'].name'),
			forceScroll: true
		});
	},

	componentWillUpdate: function(){
		var activePage = this.model.get('pages').findWhere({ active: true });
		this.info.previous = this.info.index;
		this.info.index = activePage ? activePage.get('index') : 0;
	},

	render: function() {
		//Create the page selectors
		var diff, animClass = '', indexClass = '';
		var pages = this.model.get('pages').map(function(page) {
			return (
				/* jshint ignore:start */
				React.createElement(PageSelector, {key: page.get('index'), model: page, icon: page.get('icon'), name: page.get('name'), selected: !!page.get('active'), index: page.get('index'), onToggleSelect: this.onSelection})
				/* jshint ignore:end */
			);
		}.bind(this));

		//Calculate a class for the transition animation
		diff = this.info.index - this.info.previous;
		if (diff > 0) {
			animClass = ' footer--anim-right-' + Math.abs(diff).toString();
		} else if (diff < 0) {
			animClass = ' footer--anim-left-' + Math.abs(diff).toString();
		}

		//Set an index class
		indexClass = ' footer--index-' + this.info.index.toString();

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'footer buffer' + animClass + indexClass}, 
				pages
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dispatcher":37,"../_mixins/backboneModelMixin":9,"../_mixins/infoMixin":10,"./pageSelector":24}],24:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	getDefaultProps: function() {
		return {
			active: false
		};
	},

	handleSelectionToggle: function(e) {
		this.props.onToggleSelect && this.props.onToggleSelect( this.props.index );
	},

	render: function() {
		var selectedClass = this.model.get('active') ? ' footer__selector--selected' : '';

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'footer__selector' + selectedClass, key: this.model.get('index'), name: this.model.get('name'), onClick: this.handleSelectionToggle}, 
				React.createElement("span", {className: 'footer__icon icon-' + this.model.get('icon')}), 
				React.createElement("span", {className: "footer__text"},  this.model.get('name').charAt(0).toUpperCase() + this.model.get('name').substring(1))
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9}],25:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	handleAvatarToggle: function(e) {
		this.props.onToggleAvatar && this.props.onToggleAvatar( !this.props.opened );
	},

	render: function() {
		var avatarOpenedClass = this.props.opened ? ' avatar--opened' : '';
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'avatar' + avatarOpenedClass, onClick: this.handleAvatarToggle}, 
				React.createElement("img", {className: "avatar__img", src: this.props.img}), 
				React.createElement("span", {className: "avatar__arrow buffer__icon"})
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],26:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("a", {className: "contact-list__line", target: "_blank", href: this.props.url}, 
				React.createElement("span", {className: 'contact-list__icon buffer-icon icon-' + this.props.network.toLowerCase()}), 
				React.createElement("span", {className: "contact-list__text"}, this.props.children)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],27:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var ContactStatic = require('./contactStatic');
var ContactLink = require('./contactLink');



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		//Make the static line
		var location = window.app.model.getLocation();
		var locationStr = location.get('city') +', '+ location.get('region') +', '+ location.get('countryCode') +', '+ location.get('postalCode');

		//Make the linked lines
		var links = window.app.model.getProfiles().map(function(link) {
			//https://regex101.com/r/pB7uD7/1
			return (
				/* jshint ignore:start */
				React.createElement(ContactLink, {network: link.get('network'), url: link.get('url')}, 
					link.get('url').replace(/^\w*\:\/{0,2}/i, '')
				)
				/* jshint ignore:end */
			);
		});

		//Render function
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "contact-list navbar__dropdown"}, 
				React.createElement(ContactStatic, {icon: "home"}, 
					locationStr
				), 
				links
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./contactLink":26,"./contactStatic":28}],28:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("span", {className: "contact-list__line"}, 
				React.createElement("span", {className: 'contact-list__icon buffer-icon icon-' + this.props.icon}), 
				React.createElement("span", {className: "contact-list__text"}, this.props.children)
			)
			/* jshint ignore:end */
			//{this.props.text}
			//<span className="contact-list__text">Berkeley, CA, USA, 94702</span>
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],29:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');
var Dispatcher = require('../../dispatcher');

//var SearchView = require('../components/search');
var Avatar = require('./avatar');
var TitleScroller = require('./titleScroller');
var ContactList = require('./contactList');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin, BackboneEventMixin],

	handleCloseContacts: function(e) {
		Dispatcher.dispatch({
			actionType: 'header-toggle',
			expand: false
		});
	},

	onToggleContacts: function(opened) {
		Dispatcher.dispatch({
			actionType: 'header-toggle',
			expand: this.model.get('contacts') ? false : 'contacts'
		});
	},

	render: function() {
		var contactsOpened = this.model.get('contacts') ? ' navbar--contacts' : '';
		//var searchOpened = this.model.get('search') ? ' navbar--search' : '';

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'navbar buffer' + contactsOpened}, 
				React.createElement(Avatar, {key: "avatar", img: this.model.getPicture(), onToggleAvatar: this.onToggleContacts, opened: this.model.get('contacts')}), 
				React.createElement("div", {className: "navbar__title"}, 
					React.createElement("div", {className: "navbar__title__contact navbar__title__segment"}, 
						React.createElement("h1", {className: "navbar__title__heading"}, "Contact Me"), 
						React.createElement("span", {className: "navbar__title__close buffer__icon", onClick: this.handleCloseContacts})
					), 
					React.createElement(TitleScroller, {model: this.model})
				), 
				React.createElement(ContactList, {model: this.model.getCategory('basics')})
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dispatcher":37,"../_mixins/backboneEventMixin":8,"../_mixins/backboneModelMixin":9,"./avatar":25,"./contactList":27,"./titleScroller":30}],30:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin],

	render: function() {
		var activePage = this.model.get('pages').findWhere({ active: true });
		var activeIndex = activePage ? activePage.get('index') : 0;
		
		var pageTitles = this.model.get('pages').map(function(page, i) {
			var text = i ? page.get('name') : this.model.getCategory('basics').get('name');

			return (
				/* jshint ignore:start */
				React.createElement("h1", {key: i, className: "titleScroller__span navbar__title__heading", style: {transform: 'translateY(' + (-100 * activeIndex) + '%)'}}, text.charAt(0).toUpperCase() + text.substring(1))
				/* jshint ignore:end */
			);
		}.bind(this));

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "titleScroller navbar__title__segment"}, 
				pageTitles
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/backboneModelMixin":9}],31:[function(require,module,exports){
(function (global){
var Velocity = (typeof window !== "undefined" ? window.Velocity : typeof global !== "undefined" ? global.Velocity : null);

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
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
	var App = React.createClass({displayName: "App",
		mixins: [BackboneModelMixin, BackboneEventMixin, InfoMixin],

		getInitialInfo: function(){
			return {
				ratioVisibleToActivate: 0.45, //The percentage of the next page that needs to be visible before it is "activated"
				lastWindowHeight: 0,
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
				var ratioMultiplier = window.scrollY > this.info.lastWindowHeight ? 1 - this.info.ratioVisibleToActivate : this.info.ratioVisibleToActivate;
				var cutoff = window.scrollY + Math.round(ratioMultiplier * window.innerHeight);
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

			//Update the window height no matter what
			this.setInfo({ lastWindowHeight: window.scrollY });
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
				$(document.getElementsByTagName('html')[0]).velocity('stop').velocity('scroll', {duration: 800, offset: pageOffset.top - 60});
			}
		},

		render: function() {
			return (
				/* jshint ignore:start */
				React.createElement("div", {className: "main"}, 
					React.createElement(Header, {ref: "header", key: "header", model: this.model}), 
					React.createElement(Content, {ref: "content", key: "content", model: this.model, scrollMutedUntil: this.info.scrollMutedUntil}), 
					React.createElement(Footer, {ref: "footer", key: "footer", model: this.model})
				)
				/* jshint ignore:end */
			);
		}
	});

	React.render(
		/* jshint ignore:start */
		React.createElement(App, null), 
		/* jshint ignore:end */
		document.getElementsByTagName('body')[0]
	);
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dispatcher":37,"../_mixins/backboneEventMixin":8,"../_mixins/backboneModelMixin":9,"../_mixins/infoMixin":10,"../content/content":12,"../footer/footer":23,"../header/header":29}],32:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "page__copyright"}, 
				"© Alex Zaslavsky, 2015"
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "page__header"}, 
				React.createElement("span", {className: 'page__icon icon-' + this.props.icon}), 
				React.createElement("h2", {className: "page__heading"}, this.props.text)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

var PageHeader = require('./header');
var PageCopyright = require('./copyright');



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		var pageData = window.app.model.getPage(this.props.name);
		var selectedClass = pageData.get('active') ? ' page--active' : '';
		var nameClass = this.props.name ? ' ' + this.props.name : '';

		return (
			/* jshint ignore:start */
			React.createElement("div", {className: 'page' + selectedClass + nameClass}, 
				React.createElement(PageHeader, {text: pageData.get('title'), icon: pageData.get('icon')}), 
				React.createElement("div", {className: "page__content"}, 
					this.props.children
				), 
				React.createElement(PageCopyright, null)
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./copyright":32,"./header":33}],35:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);



//View definition
module.exports = React.createClass({displayName: "exports",
	render: function() {
		return (
			/* jshint ignore:start */
			React.createElement("div", {className: "page__section"}, 
				React.createElement("h3", null, this.props.heading), 
				this.props.children
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var BackboneModelMixin = require('../_mixins/backboneModelMixin');
var BackboneEventMixin = require('../_mixins/backboneEventMixin');
var Dispatcher = require('../../dispatcher');

var Detail = require('../detail/detail');



//View definition
module.exports = React.createClass({displayName: "exports",
	mixins: [BackboneModelMixin, BackboneEventMixin],

	//We need a state AND a model to make sure re-rendering flows properly when a detail is open
	getInitialState: function() {
		return {
			offset: 0
		};
	},

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
	renderDetails: function(expanded, offset) {
		if (expanded) {
			return (
				/* jshint ignore:start */
					React.createElement(Detail, {heading: this.model.get('name'), model: this.model, onDetailClose: this.handleToggleExpand, offset: this.state.offset})
				/* jshint ignore:end */
			);
		}
	},

	//Whenever we render this guy, make sure to save the position and offset
	componentDidUpdate: function() {
		if ( this.model.get('expanded') ) {
			this.calculateOffset();
		}
	},

	//When we first render this guy, make sure to save the position and offset
	componentDidMount: function() {
		if ( this.model.get('expanded') ) {
			this.calculateOffset();
		}
	},

	//When rendering, make sure that the detail area is always on-screen
	calculateOffset: function() {
		var offset;
		var detailWidth;
		var entryWidth;
		var diff;
		var newOffset = null;
		var node = this.getDOMNode();

		//Are we on a mobile or "widescreen" (aka, 768px or wider) device?  The corresponding values match those specified in the details SCSS file
		detailWidth = window.innerWidth <= 768 ? 260 : 400;
		entryWidth = window.innerWidth <= 768 ? window.innerWidth - 40 : (window.innerWidth > 944 ? 854 : window.innerWidth - 100);

		//Get the position of the left edge relative to the left boundary
		offset = node.offsetLeft + (node.offsetWidth/2);
		diff = offset - (detailWidth/2);

		//Figure out how much we need to adjust the offset by
		if (diff < 0) {
			newOffset = -1 * diff;
		} else if (offset + detailWidth > entryWidth) {
			newOffset = entryWidth - (offset + detailWidth/2) - 16;
		}

		if (newOffset !== this.state.offset) {
			this.setState({ offset: newOffset });
		}
	},

	render: function() {
		var expandedClass = this.model.get('expanded') ? ' tag--expanded' : '';
		var hiddenClass = this.model.get('hidden') ? ' tag--hidden' : '';
		var details = this.renderDetails( this.model.get('expanded') );

		return (
			/* jshint ignore:start */
			React.createElement("span", {className: 'tag' + expandedClass + hiddenClass, onClick: this.handleToggleExpand}, 
				React.createElement("span", {className: "tag__text"}, this.model.get('name')), 
				React.createElement("span", {className: "tag__more"}), 
				 details || undefined
			)
			/* jshint ignore:end */
		);
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dispatcher":37,"../_mixins/backboneEventMixin":8,"../_mixins/backboneModelMixin":9,"../detail/detail":16}],37:[function(require,module,exports){
var Dispatcher = require('flux').Dispatcher;
module.exports = new Dispatcher();

},{"flux":1}],38:[function(require,module,exports){
(function (global){
var underscore = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var reqwest = (typeof window !== "undefined" ? window.reqwest : typeof global !== "undefined" ? global.reqwest : null);

//Set options for our global libraries, and load single use plugins
(typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
Backbone.ajax = reqwest.compat;
marked.setOptions({
	gfm: true,
	breaks: true
});
React.initializeTouchEvents();

//Markdown settings
var renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
	return '<a href="' + href + '" target="' + (href.match(/^https{0,1}\:\/\//i) instanceof Array ? '_blank' : '_self') + '">' + text + '</a>';
};
marked.setOptions({
	renderer: renderer,
	gfm: true,
	breaks: true
});

//Get JSON data
var resume = require('../json/resume');
var extra = require('../json/extra');
var copy = require('../json/copy');



//Load the fonts
var fonts = document.createElement('link');
fonts.rel = 'stylesheet';
fonts.type = 'text/css';
fonts.href = 'https://fonts.googleapis.com/css?family=Roboto:100,300,300italic,700';
document.head.appendChild(fonts);



//Load the stylesheets
var style = document.createElement('link');
style.rel = 'stylesheet';
style.type = 'text/css';
style.href = './bundle/style.css';
document.head.appendChild(style);



//Process the resume object
resume.projects = extra.projects;
resume.technologies = extra.technologies;

//Add location and email to profiles
resume.basics.profiles.unshift({
	network: 'mail',
	url: 'mailto:' + resume.basics.email
});



//Load the model and view for the entire app
var AppModel = require('./model/app');
var AppView = require('./components/main/main');

//Create an object store for the entire app
window.app = {
	model: new AppModel({
		resume: resume,
		copy: copy
	}),
	dispatcher: require('./dispatcher')
};

//Start the main view
AppView();

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../json/copy":60,"../json/extra":61,"../json/resume":62,"./components/main/main":31,"./dispatcher":37,"./model/app":40}],39:[function(require,module,exports){
var Dispatcher = require('../../dispatcher');



module.exports = {
	//A callback function for this store to interact with the dispatcher
	dispatch: function(payload) {
		this.actions(payload, this);
	},

	//Register this model's dispatcher callback with the global dispatcher, call in each inheritors "initialize" function
	register: function() {
		this.dispatchToken = Dispatcher.register(this.dispatch.bind(this));
	}
};

},{"../../dispatcher":37}],40:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var Resume = require('./resume/resume');
var Page = require('./pages/page');
var Header = require('./header/header');
var Pages = {
	about: require('./pages/about'),
	experience: require('./pages/experience'),
	skills: require('./pages/skills'),
	projects: require('./pages/projects')
};

var DispatcherRegistrationMixin = require('./_mixins/dispatcherRegistration');
var GlobalActions = require('../actions/global');



//Page and resume block pairings
var pageRefs = {
	about: ['basics'],
	experience: ['education', 'work'],
	skills: ['skills', 'technologies'],
	projects: ['projects', 'volunteering', 'interests', 'languages']
};



module.exports = Backbone.AssociatedModel.extend(
	_.extend({}, DispatcherRegistrationMixin, {
		actions: GlobalActions,

		defaults: {
			resume: {},
			pages: [],
			copy: {},
			state: {}
		},

		relations: [{
			key: 'resume',
			type: Backbone.One,
			relatedModel: Resume
		},{
			key: 'pages',
			type: Backbone.Many,
			relatedModel: Page
		},{
			key: 'header',
			type: Backbone.One,
			relatedModel: Header
		}],

		initialize: function(){
			//Register this model's actions with the dispatcher
			this.register();

			//Add pages
			var pages = this.get('pages');
			var index = 0;
			var resume = this.get('resume');
			var thisRef;
			var thisPage;
			
			for (var p in Pages) {
				thisRef = {};
				/* jshint ignore:start */
				pageRefs[p].forEach(function(v){
					thisRef[v] = resume.get(v);
				});
				/* jshint ignore:end */

				thisPage = new Pages[p](
					_.extend(thisRef, { 
						index: index,
						active: !index
					}, this.get('copy').pages[index])
				);

				pages.add(thisPage);
				index++;
			}

			pages.comparator = 'index';
		},

		getPicture: function(){
			return this.get('resume.basics.picture');
		},

		getLocation: function(){
			return this.get('resume.basics.location');
		},

		getSummary: function(){
			return this.get('resume.basics.summary');
		},

		getProfiles: function(){
			return this.get('resume.basics.profiles');
		},

		getCategory: function(cat){
			return this.get('resume').get(cat);
		},

		getPage: function(name, property){
			var page = this.get('pages').findWhere({name: name});
			if (property) {
				return page.get(property);
			}
			return page;
		},

		getHeader: function(){
			return this.get('header.expanded');
		},

		setHeader: function(opening){
			if (opening) {
				this.get('header').set({expanded: opening});
			} else {
				this.get('header').set({expanded: false});
			}
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../actions/global":6,"./_mixins/dispatcherRegistration":39,"./header/header":41,"./pages/about":43,"./pages/experience":44,"./pages/page":45,"./pages/projects":46,"./pages/skills":47,"./resume/resume":56}],41:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		contacts: false,
		//search: false,
		//searchString: ''
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],42:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var DispatcherRegistrationMixin = require('../_mixins/dispatcherRegistration');



module.exports = Backbone.AssociatedModel.extend(
	_.extend({}, DispatcherRegistrationMixin, {
		defaults: {
			active: false
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/dispatcherRegistration":39}],43:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var PageModel = require('./Page');
var Basics = require('../resume/basics');



module.exports = PageModel.extend({
	defaults: {
		name: 'about',
		icon: 'user',
		basics: {}
	},

	relations: [{
		key: 'basics',
		type: Backbone.One,
		relatedModel: Basics
	}]
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../resume/basics":51,"./Page":42}],44:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var PageModel = require('./Page');
var School = require('../resume/school');
var Job = require('../resume/job');



module.exports = PageModel.extend({
	defaults: {
		name: 'experience',
		icon: 'briefcase',
		education: [],
		work: []
	},

	relations: [{
		key: 'education',
		type: Backbone.Many,
		relatedModel: School
	},{
		key: 'work',
		type: Backbone.Many,
		relatedModel: Job
	}]
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../resume/job":54,"../resume/school":57,"./Page":42}],45:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var DispatcherRegistrationMixin = require('../_mixins/dispatcherRegistration');



module.exports = Backbone.AssociatedModel.extend(
	_.extend({}, DispatcherRegistrationMixin, {
		defaults: {
			active: false
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../_mixins/dispatcherRegistration":39}],46:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var PageModel = require('./Page');
var Project = require('../resume/project');
var Volunteer = require('../resume/volunteer');
var Interest = require('../resume/base');
var Language = require('../resume/base');



module.exports = PageModel.extend({
	defaults: {
		name: 'projects',
		icon: 'bulb',
		projects: [],
		volunteering: [],
		interests: [],
		languages: []
	},

	relations: [{
		key: 'projects',
		type: Backbone.Many,
		relatedModel: Project
	},{
		key: 'volunteering',
		type: Backbone.Many,
		relatedModel: Volunteer
	},{
		key: 'interests',
		type: Backbone.Many,
		relatedModel: Interest
	},{
		key: 'languages',
		type: Backbone.Many,
		relatedModel: Language
	}]
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../resume/base":50,"../resume/project":55,"../resume/volunteer":59,"./Page":42}],47:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var PageModel = require('./Page');
var Skill = require('../resume/tag');
var Technology = require('../resume/tag');
var FilterSet = require('../resume/filterSet');
var skillsActions = require('../../actions/skills');



module.exports = PageModel.extend({
	actions: skillsActions,

	defaults: {
		name: 'skills',
		icon: 'tools',
		skills: [],
		technologies: [],
		levels: [],
		filterSet: []
	},

	relations: [{
		key: 'skills',
		type: Backbone.Many,
		relatedModel: Skill
	},{
		key: 'technologies',
		type: Backbone.Many,
		relatedModel: Technology
	},{
		key: 'filterSet',
		type: Backbone.Many,
		relatedModel: FilterSet
	}],

	initialize: function() {
		//Register the dispatching callback
		this.register();

		//Loop through the technologies, and generate the corresponding categories, then sort them alphabetically
		var categories = [];
		this.get('technologies').each(function(v) {
			v.get('categories').forEach(function(vv) {
				if (categories.indexOf(vv) === -1) {
					categories.push(vv);
				}
			});
		});
		categories.sort(function(a, b) {
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		});

		//Loop through the techs AND skills, and get the levels
		var levels = this.get('levels') || [];
		if (!levels.length) {
			_.union(this.get('technologies').toArray(), this.get('skills').toArray()).forEach(function(v){
				if (levels.indexOf(v.get('level')) === -1) {
					levels.push(v.get('level'));
				}
			});
			levels.sort(function(a, b) {
				if(a < b) return -1;
				if(a > b) return 1;
				return 0;
			});
		}

		//Apply the filters
		this.get('filterSet').add({
			section: 'skills',
			filters: [
				{section: 'skills', type: 'level', text: 'All Experience Levels', options: levels}
			]
		});

		this.get('filterSet').add({
			section: 'technologies', 
			filters: [
				{section: 'technologies', type: 'categories', text: 'All Categories', options: categories},
				{section: 'technologies', type: 'level', text: 'All Experience Levels', options: levels}
			]
		});
	},

	//Grab the filters for a particular section
	getFilters: function(section) {
		var filterSet = this.get('filterSet').findWhere({section : section});
		if (filterSet) {
			return filterSet.get('filters');
		}
		return new Backbone.Collection();
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../actions/skills":7,"../resume/filterSet":53,"../resume/tag":58,"./Page":42}],48:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var minors = require('title-case-minors');



module.exports = {
	parseFragments: function(){
		var fields, output = [];
		fields = Array.prototype.slice.call(arguments);

		fields.forEach(function(v) {
			var modified, words;
			//Remove punctuation, upper->lower, and trime whitespace at beginning and end
			modified = this.get(v).replace(/[^\w\s]/gi, '').toLowerCase().trim();

			//Split into an array of words
			words = modified.split(' ');

			//Remove all "minor" words like "the" and "with," etc
			words.forEach(function(vv){
				if (minors.indexOf(vv) === -1 && output.indexOf(vv) === -1) {
					output.push(vv);
				}
			});
		}.bind(this));

		output.length && this.set('query', output);
	}
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"title-case-minors":4}],49:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);



module.exports = {
	getKeywords: function(type, lead, strArray){
		var output, list, str;

		this.get('highlights').forEach(function(v, i){
			var index;
			if (!str) {
				index = v.indexOf(lead +':');
				if (index === 0) {
					str = i;
				}
			}
		});

		if (typeof str === 'number' && str > -1) {
			output = [];
			list = strArray[str].split(':')[1];
			list = list.split(', ');

			list.forEach( function(v) {
				output.push( v.toLowerCase().replace('&', '').trim() );
			});

			if (output.length) {
				this.set(type, output);
			}
		}
	}
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);



module.exports = Backbone.AssociatedModel.extend({
	//Make this model searchable
	queryList: function() {
		var query = [];
		var aliases = this.get('aliases');
		if (aliases instanceof Array && aliases.length) {
			aliases.forEach(function(v, i) {
				typeof v === 'string' && query.push( v.toLowerCase().trim() );
			});
		}
		this.get('name') && query.unshift( this.get('name').toLowerCase().trim() );
		query.length && this.set('query', query);
	},

	//Searchable keywords
	keywordList: function() {
		this.get('keywords') instanceof Array && this.set('keywords', this.get('keywords').map(function(v) {
			return v.toLowerCase().trim();
		}));
	},

	initialize: function(){
		this.queryList();
		this.keywordList();
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],51:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		location: {},
		profiles: []
	},

	relations: [{
		key: 'location',
		type: Backbone.One,
		relatedModel: Backbone.AssociatedModel
	},{
		key: 'profiles',
		type: Backbone.Many,
		relatedModel: Backbone.AssociatedModel
	}],

});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],52:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		section: '',
		type: '',
		text: 'All',
		options: [],
		active: false,
		expanded: false
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],53:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Filter = require('./filter');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		section: '',
		filters: []
	},

	relations: [{
		key: 'filters',
		type: Backbone.Many,
		relatedModel: Filter
	}]
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./filter":52}],54:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var BaseModel = require('./base');
var KeywordListMixin = require('./_mixins/keywordList');
var FragmentParserMixin = require('./_mixins/fragmentParser');



module.exports = BaseModel.extend(
	_.extend({}, KeywordListMixin, FragmentParserMixin, {
		initialize: function(){
			this.getKeywords('skills', 'Skills', this.get('highlights'));
			this.getKeywords('stack', 'Stack', this.get('highlights'));
			this.parseFragments('company', 'position', 'summary');
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_mixins/fragmentParser":48,"./_mixins/keywordList":49,"./base":50}],55:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var BaseModel = require('./base');
var KeywordListMixin = require('./_mixins/keywordList');



module.exports = BaseModel.extend(
	_.extend({}, KeywordListMixin, {
		defaults: {
			stars: '',
			forks: ''
		},

		parse: function(results) {
			var output = {};
			if (results.items && results.items.length) {
				output.stars = typeof results.items[0].stargazers_count === 'number' ? results.items[0].stargazers_count : '';
				output.forks = typeof results.items[0].forks_count === 'number' ? results.items[0].forks_count : '';
			}

			return output;
		},

		initialize: function(){
			this.getKeywords('skills', 'Skills', this.get('highlights'));
			this.getKeywords('stack', 'Stack', this.get('highlights'));

			//If the website is a link to a github repo, create a fetching function, and go get that data!
			if (typeof this.get('website') === 'string' && this.get('website').match(/:\/\/github\.com\/(?:\w*)\/(?:\w*)/i)) {
				//Get the user/org, and the repo name
				var user, repo, queryString = '', fragment = this.get('website').substring( this.get('website').indexOf('github.com/') + 11 );

				if (fragment.length && fragment.indexOf('/') > -1) {
					fragment = fragment.split('/');
					user = fragment[0];
					repo = fragment[1];

					//Set the urlRoot and id
					queryString = 'q=' + repo + 'user:' + user;
					this.urlRoot = 'https://api.github.com/search/repositories?' + queryString;

					this.fetch();
				}

				//this.urlRoot('https://github.com');
			}
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_mixins/keywordList":49,"./base":50}],56:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var Basics = require('./basics');
var School = require('./school');
var Job = require('./job');
var Project = require('./project');
var Skill = require('./tag');
var Technology = require('./tag');
var Volunteer = require('./volunteer');
var Language = require('./base');
var Interest = require('./base');



module.exports = Backbone.AssociatedModel.extend({
	defaults: {
		basics: {},
		education: [],
		work: [],
		projects: [],
		skills: [],
		technologies: [],
		volunteering: [],
		languages: [],
		interests: []
	},

	relations: [{
		key: 'basics',
		type: Backbone.One,
		relatedModel: Basics
	},{
		key: 'education',
		type: Backbone.Many,
		relatedModel: School
	},{
		key: 'work',
		type: Backbone.Many,
		relatedModel: Job
	},{
		key: 'projects',
		type: Backbone.Many,
		relatedModel: Project
	},{
		key: 'skills',
		type: Backbone.Many,
		relatedModel: Skill
	},{
		key: 'technologies',
		type: Backbone.Many,
		relatedModel: Technology
	},{
		key: 'volunteering',
		type: Backbone.Many,
		relatedModel: Volunteer
	},{
		key: 'languages',
		type: Backbone.Many,
		relatedModel: Language
	},{
		key: 'interests',
		type: Backbone.Many,
		relatedModel: Interest
	}]
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./base":50,"./basics":51,"./job":54,"./project":55,"./school":57,"./tag":58,"./volunteer":59}],57:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var BaseModel = require('./base');
var FragmentParserMixin = require('./_mixins/fragmentParser');



module.exports = BaseModel.extend(
	_.extend({}, FragmentParserMixin, {
		initialize: function(){
			this.parseFragments('institution', 'area', 'studyType', 'gpa');
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_mixins/fragmentParser":48,"./base":50}],58:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var BaseModel = require('./base');



module.exports = BaseModel.extend({
	defaults: {
		expanded: false,
		hidden: false
	}
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./base":50}],59:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var BaseModel = require('./base');
var FragmentParserMixin = require('./_mixins/fragmentParser');



module.exports = BaseModel.extend(
	_.extend({}, FragmentParserMixin, {
		initialize: function(){
			this.parseFragments('organization', 'position', 'summary');
		}
	})
);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_mixins/fragmentParser":48,"./base":50}],60:[function(require,module,exports){
module.exports={
	"pages": [
		{
			"index": 0,
			"name": "about",
			"title": "Hi, I'm Alex!",
			"body": [
				{
					"type": "h3",
					"content": "About This App",
				},
				{
					"type": "p",
					"content": "This app was created to serve as an interactive resume, and to act as a living sample of my design and coding abilities.  The app is based on my extended version of the [JSON Resume protocol](https://jsonresume.org/schema/).  It uses SASS and Bourbon for CSS preprocessing, and the following 3rd-party Javascript libraries: Browserify, reqwest, marked, Velocity.js, Underscore, Backbone, Backbone-Associations, React, and Flux.  It also uses a few Javascript modules I wrote myself: [searchGuesser](https://github.com/azaslavsky/searchGuesser), [sneakyBars](https://github.com/azaslavsky/sneakyBars), and [backbone-hashMate](https://github.com/azaslavsky/backbone-hashMate)."
				},
				{
					"type": "h3",
					"content": "Other Formats",
				},
				{
					"type": "p",
					"content": "A truncated, more \"traditional\" version of my resume may be accessed in several other formats.  It can be [viewed online](https://represent.io/alexzaslavsky) or as a [PDF](https://represent.io/alexzaslavsky.pdf). It is also registered as a [JSON Resume](http://registry.jsonresume.org/alexzaslavsky).  Finally, the entire JSON set from which this app is populated is available in the [Github repository](https://github.com/azaslavsky/resume/tree/master/json).",
				},
				{
					"type": "h3",
					"content": "Get In Touch",
				},
				{
					"type": "p",
					"content": "I'm easy to find online, so feel free to get in touch via any one of the mediums [listed here](#page=about&contact).",
				}
			]
		},
		{
			"index": 1,
			"name": "experience",
			"title": "Professional Background"
		},
		{
			"index": 2,
			"name": "skills",
			"title": "Skills",
			"levels": ["Familiar", "Proficient", "Excellent"]
		},
		{
			"index": 3,
			"name": "projects",
			"title": "Other Projects & Interests"
		}
	],
	"images": ""
}
},{}],61:[function(require,module,exports){
module.exports={
	"projects": [
		{
			"name": "backbone-hashMate",
			"website": "https://github.com/azaslavsky/backbone-hashMate",
			"summary": "Like jQuery BBQ, but for Backbone. HashMate extends Backbone.History to store and respond to information contained in the URL's hash fragment. Useful for state management, referral handling, SEO and more.",
			"highlights": [
				"Skills: Behavior Driven Development, Client-Side Development",
				"Stack: Backbone, Git, Gulp, Jasmine, Javascript, Karma, Underscore"
			]
		},
		{
			"name": "domJSON",
			"website": "https://github.com/azaslavsky/domJSON",
			"summary": "Converts DOM trees into compact JSON objects, and vice versa, as fast as possible.",
			"highlights": [
				"Skills: Client-Side Development, Browser Performance Optimization",
				"Stack: Git, Gulp, HTML5, CSS3, Javascript"
			]
		},
		{
			"name": "resume",
			"website": "https://github.com/azaslavsky/resume",
			"summary": "A little single page web-app for my resume, which you are looking at right now.",
			"highlights": [
				"Skills: API Integration, Client-Side Development, User Interfaces, User Experience",
				"Stack: Backbone, Bourbon, Browserify, CSS3, Flux, Git, Gulp, Javascript, jQuery, React, Underscore"
			]
		},
		{
			"name": "TextStack",
			"website": "https://github.com/azaslavsky/TextStack",
			"summary": "A simple undo history script for DOM text fields.",
			"highlights": [
				"Skills: Client-Side Development, User Interfaces",
				"Stack: Git, Gulp, HTML5, Javascript, jQuery"
			]
		},
	],
	"technologies": [
		{
			"name": "Backbone",
			"aliases": ["ExoSkeleton"],
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "BenchmarkJS",
			"aliases": ["Benchmark"],
			"categories": ["Testing"],
			"level": "Familiar"
		},
		{
			"name": "Bootstrap",
			"categories": ["Front End", "Libraries"],
			"level": "Proficient"
		},
		{
			"name": "Bourbon",
			"categories": ["Design", "Front End", "Libraries", "Productiviy Tools"],
			"level": "Excellent"
		},
		{
			"name": "Bower",
			"categories": ["Front End", "Productiviy Tools"],
			"level": "Excellent"
		},
		{
			"name": "Browserify",
			"categories": ["Front End", "Libraries"],
			"level": "Proficient"
		},
		{
			"name": "Chrome Extensions API",
			"categories": ["Front End", "Languages/Standards"],
			"level": "Excellent"
		},
		{
			"name": "Compass",
			"categories": ["Design", "Front End", "Libraries", "Productiviy Tools"],
			"level": "Proficient"
		},
		{
			"name": "CSS3",
			"aliases": ["CSS"],
			"categories": ["Design", "Front End", "Languages/Standards"],
			"level": "Excellent"
		},
		{
			"name": "ES6",
			"aliases": ["ECMAScript 6"],
			"categories": ["Languages/Standards"],
			"level": "Proficient"
		},
		{
			"name": "Flux",
			"categories": ["Front End", "Libraries"],
			"level": "Familiar"
		},
		{
			"name": "Google Maps",
			"aliases": ["GMaps", "Google Maps V3", "GMaps V3"],
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "Git",
			"categories": ["Productiviy Tools"],
			"level": "Proficient"
		},
		{
			"name": "Gulp",
			"categories": ["Productiviy Tools"],
			"level": "Excellent"
		},
		{
			"name": "Handlebars",
			"categories": ["Front End", "Libraries"],
			"level": "Proficient"
		},
		{
			"name": "HTML5",
			"aliases": ["HTML"],
			"categories": ["Front End", "Languages/Standards"],
			"level": "Excellent"
		},
		{
			"name": "Illustrator",
			"aliases": ["Adboce Illustrator"],
			"categories": ["Design", "Front End"],
			"level": "Excellent"
		},
		{
			"name": "Jasmine",
			"categories": ["Libraries", "Testing"],
			"level": "Excellent"
		},
		{
			"name": "Javascript",
			"aliases": ["JS"],
			"categories": ["Languages/Standards"],
			"level": "Excellent"
		},
		{
			"name": "jQuery",
			"aliases": ["Zepto"],
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "Karma",
			"aliases": ["Karma Runner"],
			"categories": ["Testing", "Productiviy Tools"],
			"level": "Proficient"
		},
		{
			"name": "Leaflet",
			"categories": ["Front End", "Libraries"],
			"level": "Familiar"
		},
		{
			"name": "Marionette",
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "Mixpanel",
			"aliases": ["Analytics"],
			"categories": ["Front End", "Libraries"],
			"level": "Proficient"
		},
		{
			"name": "Mocha",
			"categories": ["Libraries", "Testing"],
			"level": "Familiar"
		},
		{
			"name": "Modernizr",
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "mySQL",
			"aliases": ["SQL"],
			"categories": ["Back End", "Languages/Standards"],
			"level": "Proficient"
		},
		{
			"name": "Nightwatch",
			"categories": ["Front End", "Libraries", "Testing"],
			"level": "Familiar"
		},
		{
			"name": "Node.js",
			"aliases": ["Node"],
			"categories": ["Back End", "Languages/Standards"],
			"level": "Familiar"
		},
		{
			"name": "Photoshop",
			"aliases": ["Adobe Photoshop"],
			"categories": ["Design", "Front End"],
			"level": "Proficient"
		},
		{
			"name": "PHP5",
			"aliases": ["PHP"],
			"categories": ["Back End", "Languages/Standards"],
			"level": "Familiar"
		},
		{
			"name": "React",
			"categories": ["Front End", "Libraries"],
			"level": "Familiar"
		},
		{
			"name": "REST",
			"aliases": ["RESTful", "REST API", "RESTful API"],
			"categories": ["Languages/Standards"],
			"level": "Proficient"
		},
		{
			"name": "RequireJS",
			"categories": ["Front End", "Libraries"],
			"level": "Excellent"
		},
		{
			"name": "SASS",
			"aliases": ["SCSS", "CSS Preprocessor"],
			"categories": ["Design", "Front End", "Libraries", "Productiviy Tools"],
			"level": "Excellent"
		},
		{
			"name": "Selenium",
			"aliases": ["WebDriver"],
			"categories": ["Front End", "Testing"],
			"level": "Proficient"
		},
		{
			"name": "Underscore",
			"aliases": ["loDash"],
			"categories": ["Libraries"],
			"level": "Excellent"
		},
		{
			"name": "Web Components",
			"aliases": ["Polymer"],
			"categories": ["Front End", "Languages/Standards"],
			"level": "Familiar"
		}
	]
}
},{}],62:[function(require,module,exports){
module.exports={
	"basics": {
		"name": "Alex Zaslavsky",
		"label": "Front End Designer and Developer",
		"picture": "https://media.licdn.com/mpr/mpr/p/7/005/01d/3c8/33e4340.jpg",
		"email": "alex.zaslavsky.1990@gmail.com",
		"phone": "510.303.4126",
		"website": "https://azaslavsky.github.io/resume",
		"summary": "I'm a Front End Designer and Developer currently looking for a position that will allow me to grow and contribute on a technical, UI, and UX design level.  I'm eager to work on projects that will allow me to synthesize my design and coding skills to make something truly fantastic.",
		"location": {
			"postalCode": "94546",
			"city": "Castro Valley",
			"countryCode": "US",
			"region": "CA"
		},
		"profiles": [
			{
				"network": "LinkedIn",
				"username": "Alex Zaslavsky",
				"url": "https://www.linkedin.com/in/ayzaslavsky"
			},
			{
				"network": "Twitter",
				"username": "alex__zaslavsky",
				"url": "https://twitter.com/alex__zaslavsky"
			},
			{
				"network": "Github",
				"username": "azaslavsky",
				"url": "https://github.com/azaslavsky"
			},
			{
				"network": "StackOverflow",
				"username": "AlexZ",
				"url": "http://stackoverflow.com/users/2230156"
			},
			{
				"network": "Codepen",
				"username": "azaslavsky",
				"url": "http://codepen.io/azaslavsky"
			}
		]
	},
	"education": [
		{
			"institution": "UC Berkeley",
			"area": "Architecture",
			"studyType": "B.A.",
			"startDate": "2008-08-25",
			"endDate": "2012-12-20",
			"gpa": "3.4"
		}
	],
	"work": [
		{
			"company": "Critica",
			"position": "Co-Founder",
			"website": "http://dev-app.critica.io",
			"startDate": "2013-11-15",
			"endDate": "2015-01-15",
			"summary": "I co-founded Critica, a consumer and education focused discussion app, with two friends in 2013.  I was responsible for the entire user facing portion of the product, including UI/UX design, client-side Javascript, and integration with in-house and third party back-end APIs.",
			"highlights": [
				"Skills: Client-Side Development, UI, UX, Design, API Integration",
				"Stack: Git, HTML5, CSS3, Javascript, RequireJS, jQuery, Underscore, Backbone, Marionette, Handlebars, Modernizr, Node.js, Gulp, & Chrome Extensions"
			]
		},
		{
			"company": "SafeTREC",
			"position": "Web Developer",
			"website": "http://tims.berkeley.edu",
			"startDate": "2010-01-10",
			"endDate": "2013-12-31",
			"summary": "At SafeTREC, I was part of the small team that built the TIMS (Transport Injury Mapping System) suite of traffic safety applications. My contributions focused on web design, back end database integration via PHP, and the development of search and query algorithms.",
			"highlights": [
				"Skills: Client-Side Development, Server-Side Development, UI, UX, Design, API Integration, SQL Databases",
				"Stack: Git, PHP5, CSS3, HTML5, Javascript, jQuery, Google Maps, & Leaflet"
			]
		}
	],
	"skills": [
		{
			"name": "Client-Side Javascript",
			"level": "Excellent",
			"keywords": ["HTML5", "CSS3", "SASS", "Bootstrap", "Javascript", "ES6", "Web Components", "Underscore", "Backbone", "Marionette", "React"],
			"aliases": ["Client-Side Development"]
		},
		{
			"name": "Behavior Driven Development",
			"keywords": ["unit testing", "e2e", "Jasmine", "Mocha", "Karma", "BenchmarkJS", "Selenium", "NightWatch"],
			"level": "Proficient"
		},
		{
			"name": "Browser Performance Optimization",
			"level": "Excellent",
			"keywords": ["Chrome Timeline", "Dev Tools", "Speed Test"]
		},
		{
			"name": "Back-End Development",
			"level": "Familiar",
			"keywords": ["PHP5", "Node.js", "REST"],
			"aliases": ["Server-Side Development"]
		},
		{
			"name": "User Interfaces",
			"level": "Excellent",
			"keywords": ["responsive design", "HTML5", "CSS3", "SASS", "Bootstrap"],
			"aliases": ["UI"]
		},
		{
			"name": "User Experience",
			"level": "Excellent",
			"keywords": ["mockups", "wireframing", "Mixpanel"],
			"aliases": ["UX"]
		},
		{
			"name": "API Integration",
			"level": "Excellent",
			"keywords": ["RESTful", "API"],
			"aliases": ["APIs"]
		},
		{
			"name": "Databases",
			"level": "Proficient",
			"keywords": ["SQL", "mySQL"],
			"aliases": ["SQL Databases"]
		}
	],
	"languages": [
		{
			"language": "English",
			"fluency": "Fluent"
		},
		{
			"language": "Russian",
			"fluency": "Fluent"
		}
	],
	"interests": [
		{
			"name": "Architecture",
			"keywords": ["architecture", "urbanism", "design"]
		},
		{
			"name": "Skiing",
			"keywords": ["downhill", "backcountry"]
		},
		{
			"name": "Hiking",
			"keywords": ["climbing", "backpacking"]
		},
		{
			"name": "Film",
			"keywords": ["Sci Fi", "Comedy", "Drama"]
		}
	]
}
},{}]},{},[38])