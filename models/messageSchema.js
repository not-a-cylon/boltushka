//  exports a messageSchema

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema({
    author: String,                 //  who wrote the message
    timestamp: String,              //  when
    message: String                 //  and what
});

module.exports = messageSchema;