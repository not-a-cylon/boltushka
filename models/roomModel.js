var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//  import the messageSchema template
//var messageSchema = require("./messageSchema")

var roomSchema = new Schema({
    roomName: String,           //  name of the room
    usersPresent: String,       //  number of users present
    lastActivity: String,       //  the timestamp of the last activity
    log: [{                     //  an array of message objects posted to the room
        author: String,
        timestamp: String,
        message: String
    }]
});

var Rooms = mongoose.model('Rooms',roomSchema);

module.exports = Rooms;