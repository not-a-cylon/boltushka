var express = require('express');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var config = require('./config');
var mongoose = require('mongoose');

//  create global storage for current rooms.
var namespaces = [];

app.set('port', (process.env.PORT || 5000));

//  force '/' to return rendered template before express.static kicks in.
app.get('/',function(req,res){
    var url = process.env.PAGE_URL || "http://localhost:" + app.get('port');
    var data = {
        //  the url socket.io will attempt to connect to. defaults to localhost if config var is missing.
        PAGE_URL: url
    };
    res.render("index.ejs",data);
});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//  connect to MongoDB server
mongoose.connect(config.getDbConnectionString());
// ------------------------------------------------
// APIs disabled for now

//var apiController = require("./controllers/apiController.js");
var chatController = require("./controllers/chatController.js");
//apiController(app);
chatController(app,io,namespaces); //  the API deals with sockets, so pass in a reference to the io object.
// ------------------------------------------------

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//  list storing names of available rooms (or socket namespaces)
/*
var nsp = io.of('/secretRoom');
nsp.on('connection',function(socket){
    socket.emit("response","welcome to the secret room");
});*/

/*io.on('connection', function(socket) {  
    console.log('Client connected...');
    socket.join('gChat');
    io.to('genChat').emit("welcome","hello from genchat!");
    //socket.on('join', function(data) {
    //    console.log(data);
    //})
});*/