angular.module('userService',[])

.factory('User', function($http) {

	var userFactory = {};

	// Gets one user
	userFactory.get = function(id) {
		return $http.get('/api/users/' + id);
	};

	// Gets all users
	userFactory.all = function() {
		return $http.get('/api/users/');
	};

	// Creates a user
	userFactory.create = function(userData) {
		return $http.post('/api/users/', userData);
	};

	// Update a user's info
	userFactory.update = function(id, userData) {
		return $http.put('/api/users/' + id, userData);
	};

	// Delete a user
	userFactory.delete = function(id) {
		return $http.delete('/api/users/' + id);
	};

	return userFactory;

});