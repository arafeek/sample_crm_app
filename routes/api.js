var jwt 		= 		require('jsonwebtoken');
var User 		= 		require('../models/user');
var config 		= 		require('../config');

var superSecret = config.secret;

module.exports = function(app, express) {
	// Get an instance of the express router
	var apiRouter = express.Router();

	// route to authenticate a user. POST http://localhost:8080/api/authenticate

	apiRouter.post('/authenticate', function(req, res) {
		// Find the user
		// Select their username and password explicitly

		User.findOne({
			username : req.body.username
		})
		.select('name username password')
		.exec(function(err, user) {
			if (err)
				throw err;

			// No user with that username was found
			if (!user) {
				res.json({
					success: false,
					message: 'Authentication failed. User not found.'
				});
			}
			else if (user) {
				// Check that the password matches
				var validPassword = user.comparePassword(req.body.password);

				if (!validPassword) {
					res.json({
						success: false,
						message: 'Authentication failed. Wrong password.'
					});
				}
				else {
					// User is found and password is correct
					// make a token for them
					var tokenPayload = {
						name: user.name,
						username: user.username
					}

					var tokenOptions = {
						expiresInMinutes: 1440 // 24 hours
					}

					// See https://github.com/auth0/node-jsonwebtoken
					var token = jwt.sign(tokenPayload, superSecret, tokenOptions);

					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}
		});
	});


	// Middleware to apply to all requests
	apiRouter.use(function(req, res, next) {
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// Decode token
		if(token) {

			// Verifies secret and checks exp
			jwt.verify(token, superSecret, function(err, decoded) {
				if (err) {
					return res.status(403).send({
						success : false,
						message : 'Failed to authenticate token.'
					});
				}
				else {
					req.decoded = decoded;

					next();
				}
			});
		}
		else {
			// If there is no token
			// Return a HTTP response of 403 (forbidden) and an error message
			return res.status(403).send({
				success : false,
				message : 'No token provided'
			});
		}
		// TODO: add more middleware
	})

	apiRouter.get('/', function(req, res) {
		res.json({ message: 'Hooray! Welcome to the api!'});
	});

	// ROUTES FOR USERS /users

	apiRouter.route('/users')
		.post(function(req, res) {
			var user = new User();

			// set the info for user, comes from the request
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;

			// Attempt to save the new user, check for any errors
			user.save(function(err) {
				if (err) {
					if(err.code == 11000) // duplicate entry
						return res.json({ success: false, message : "A user with that username already exists"});
					else
						return res.send(err);
				}

				res.json({ message: 'User created!'});
			});
		})

		.get(function(req, res) {
			User.find(function(err, users) {
				if (err)
					res.send(err);

				res.json(users);
			});
		});


	// ROUTES FORR /api/users/:user_id

	apiRouter.route('/users/:user_id')
		// Get the user for that ID
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err)
					res.send(err);

				res.json(user);
			});
		})

		// Update the user info
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err)
					res.send(err);

				// Only update fields if they are present in the request
				// prevents setting fields to blank if they were not specified
				if(req.body.name)
					user.name = req.body.name;

				if(req.body.username)
					user.username = req.body.username;

				if(req.body.password)
					user.password = req.body.password;

				user.save(function(err) {
					if (err)
						res.send(err);

					res.json({
						message: "User updated!"
					});
				});

			});
		})

		// DELETE a user
		.delete(function(req, res) {
			User.remove({
				_id : req.params.user_id
			}, function(err, user) {
				if (err)
					return res.send(err);

				res.json({ message: "Successfully deleted."});
			});
		});
	// API endpoint to get information for a logged in user
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	
	return apiRouter;
}