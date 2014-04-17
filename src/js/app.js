function isEmpty(value) {
	return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

( function (w) {

	w.fieldless = angular.module('fieldless', ['ngRoute', 'ui.bootstrap', 'xeditable', 'hljs']);

	// set xeditable theme to bs3
	w.fieldless.run( function (editableOptions) {
		editableOptions.theme = 'bs3'; 
	});

	w.fieldless.config(['$routeProvider', 'hljsServiceProvider', function ($routeProvider, hljsServiceProvider) {
		$routeProvider
		.when('/', { 
			title: ' Fieldless - Create Salesforce objects faster! ',
			templateUrl: 'views/main.tpl.html', 
			controller: 'main'
		})
		.otherwise('/');
		
		hljsServiceProvider.setOptions({
			tabReplace: '    ' // replace tab with 4 spaces
		});
	}]);
	
}).apply(this, (typeof document !== "undefined") ? [window] : [] );