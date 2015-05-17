// Setup all packages
var express 	= 		require('express');
var app 		= 		express();
var bodyParser 	= 		require('body-parser');
var morgan	 	= 		require('morgan');
var mongoose 	= 		require('mongoose');
var config 		= 		require('./config');
var path 		= 		require('path');

// APP configuration

// Use bodyParser to grab info from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Configure app to hangle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// Log all requests to the console
app.use(morgan('dev'));



// Connect to the db
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// API Routes
//===========================================

var apiRoutes 		= 		require('./routes/api')(app, express);
// REGISTER OUR ROUTES ----------------------------
// all routes will be prefixed with /api
app.use('/api', apiRoutes);

// Main catchall route
// Sends users to frontend
// has to be registered after apiRoutes

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
})



// START THE SERVER
//=================================================
app.listen(config.port);
console.log('Magic happens on port: ' + config.port);