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