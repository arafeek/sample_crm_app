// ===================================================
// auth factory to login and get information
// inject $http for communicating with the API
// inject $q to return promise objects
// inject AuthToken to manage tokens
// ===================================================
angular.module('authService', [])

.factory('Auth', function($http, $q, AuthToken) {
	var authFactory = {};

	authFactory.login = function(username, password) {
		// return the promise object and its data
		return $http.post('/api/authenticate', {
			username: username,
			password: password
		})
		.success(function(data) {
			AuthToken.setToken(data.token);
			return data;
		});
	};

	authFactory.logout = function() {
		// Clears the token
		AuthToken.setToken();
	}

	authFactory.isLoggedIn = function() {
		if(AuthToken.getToken())
			return true;
		else
			return false;
	};

	// Get the logged in user
	authFactory.getUser = function() {
		if (AuthToken.getToken())
			return $http.get('/api/me', { cache: true });
		else 
			return $q.reject({ message: 'User has no token :( '});
	};

	return authFactory;
})

//=======================================================
// Factory for handeling tokens
// inject $window to store token client side
//=======================================================

.factory('AuthToken', function($window) {
	var authTokenFactory = {};
	
	authTokenFactory.getToken = function() {
		return $window.localStorage.getItem('token');
	};

	// Can be used to clear the token, if none supplied
	authTokenFactory.setToken = function(token) {
		if (token)
			$window.localStorage.setItem('token', token);
		else
			$window.localStorage.removeItem('token');
	};

	return authTokenFactory;
})

//=======================================================
// application configuration to integrate token into 
// requests
//=======================================================
.factory('AuthInterceptor', function($q, $location, AuthToken) {
	var interceptorFactory = {};

	// This will happen on all HTTP requests
	interceptorFactory.request = function(config) {
		var token = AuthToken.getToken();

		// If the token exists, add it to the header as x-access-token
		if(token)
			config.headers['x-access-token'] = token;

		return config;
	};

	// happens on response errors
	interceptorFactory.responseError = function(response) {
		// if the server returns a 403
		if(response.status == 403) {
			AuthToken.setToken();
			$location.path('/login');
		}

		// return errors from the server as a promise
		return $q.reject(response);
	};

	return interceptorFactory;
});


