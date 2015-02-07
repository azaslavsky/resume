var ActionManager = require('./actions');



//A manifest that pairs actionTypes with their respective methods in this instance of ActionManager
var manifest = {
	'scroll': 'scroll'
};



//All actions are executed in the context of the supplied model, if one is provided
var GlobalActions = new ActionManager(manifest, {
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