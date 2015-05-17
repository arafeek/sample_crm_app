var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
	name: String
	,username: { 
		type: String
		,required: true
		,index: {
			unique: true
		}
	}	
	,password: {
		type: String
		,required: true
		,select: false
	}
});

// Hash the password before the user is saved
UserSchema.pre('save', function(next) {
	var user = this;

	// Hash only if user is new or password has been updated
	if(!user.isModified('password')) 
		return next();

	// Generate the hash
	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) 
			return next(err);

		// Update the password to the hashed version
		user.password = hash;
		next();
	});
});

// Compares a given password with the db hash
UserSchema.methods.comparePassword = function(password) {
	var user = this;

	return bcrypt.compareSync(password, user.password);
}

// Return the model 'User' which utilizes the 'UserSchema' schema
module.exports = mongoose.model('User', UserSchema);
