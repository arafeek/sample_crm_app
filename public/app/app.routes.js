// inject ngRoute for all our routing purposes
angular.module('app.routes', ['ngRoute'])

// configure our routes
.config(function($routeProvider, $locationProvider) {
	$routeProvider
		// route for the home page
		.when('/', {
			templateUrl		: 'app/views/pages/home.html'
		})

    // Route for the login page
    .when('/login', {
        templateUrl : 'app/views/pages/login.html',
        controller : 'mainController',
        controllerAs : 'login'
    })

    // Route for viewing all users
    .when('/users', {
      templateUrl : 'app/views/pages/users/all.html',
      controller : 'userController',
      controllerAs : 'user'
    })

    // form to creat a new user
    // same view as edit
    .when('/users/create', {
      templateUrl : 'app/views/pages/users/single.html',
      controller : 'userCreateConroller',
      controllerAs : 'user'
    })

    .when('/users/:user_id', {
      templateUrl : 'app/views/pages/users/single.html',
      controller : 'userEditController',
      controllerAs : 'user'
    });

	// set our app up to have pretty URLS
	$locationProvider.html5Mode(true);
})