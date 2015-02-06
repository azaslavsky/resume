var ActionManager = require('./actions');



//A manifest that pairs actionTypes with their respective methods in this instance of ActionManager
var manifest = {
	'scroll': 'scroll'
};



//All actions are executed in the context of the supplied model, if one is provided
var GlobalActions = new ActionManager(manifest, {
	scroll: function(data, model) {
		model.get('pages').each(function(page){
			page.set('active', data.page === page.get('name') ? true : false, {silent: true});
		});

		//Emit the change event, but keep it shallow
		model.trigger('change');
	}
});



module.exports = GlobalActions.create();