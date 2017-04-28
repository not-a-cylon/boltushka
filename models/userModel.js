var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//  a user schema will contain their username and IP address associated with it.
var userSchema = new Schema({
    username: String,
    IP: String
});

var Users = mongoose.model('Users',userSchema);

module.exports = Users;