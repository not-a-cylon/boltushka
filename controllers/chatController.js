var Rooms = require('../models/roomModel');
var bodyParser = require('body-parser');

//  checks to see if the specified room exists in the collection; returns boolean accordingly
function roomExists(roomName){
    var result = true;
    return false;   //  temporary debugging
    /*Rooms.count(
        {"roomName":roomName},
        function(err,count){
            if(err) throw err
            result = (count > 0);
        }
    )
    return result;*/
}

//  needs instances of app and io module passed in, in addition to reference to list storing room names;
module.exports = function(app,io,namespaces){

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded(  {extended:true} ));

    //  respond to POST requests to /chat by creating new chatroom;
    //  requires that param 'roomName' be passed in;
    app.post("/chat",function(req,res){
        var room = req.body.roomName;
        var namespace = io.of('/' + room);
        if(namespaces.indexOf(namespace.name)===-1){

            console.log("Creating new room: " + room);

            //  create a record for the new room
            //  create a namespace for it and store its name in the directory
            namespaces.push(namespace.name);
            //  attach connection handler to new namespace (only once, when room is created), to address new sockets
            namespace.on('connection',function(socket){
                console.log("NAME: " + namespace.name);
                var newUser = socket.request._query['handle'];
                //  attach the new socket to the namespace
                socket.join(namespace);
                //  emit a welcome message to the joined socket.
                socket.emit("welcome","You are now joining room " + room);
                //  tell the entire room that a new user joined.
                namespace.emit("notification","User " + newUser + " joined the room.");

                //  when socket receives "message" event, submit to the entire namespace.
                socket.on("message",function(data){
                    io.of(namespace.name).emit("message",data);
                });

            });

        }
        res.send("sucess!");
    });

    //  updates log of chatroom with message
    app.post("/chat/log",function(req,res){
        var newMessage = {
            author: req.body.username,
            timestamp: Date.now(),
            message: req.body.message
        };
        if(roomExists(req.body.roomName)){
            //  find the appropriate room and modify its record
            Rooms.findOneAndUpdate(
                {"roomName": req.body.roomName},    //  query
                {
                    $push: {"log": newMessage},
                    $set: {"lastActivity": Date.now()}
                }, //  push the new message into existing array
                function(err){
                    if(err) throw err
                    res.write("Successfully added message");
                }
            );
        }   else{
            console.log("room " + req.body.roomName + " no longer exists")
        }
    });

    //  returns all data associated with a room, formatted as a collection of JSON objects
    app.get("/chat/:roomname",function(req,res){
        Rooms.find({
            "roomName":req.params.roomname
        },function(err,result){
            if(err) throw err
            res.send(result.toString());
        });
    });

    //  removes an existing chatroom
    app.delete("/chat/:roomname",function(req,res){
        Rooms.remove({ "roomName": req.params.roomname },function(err){
            if(err){
                console.log("encountered error while deleting room " + req.params.roomname);
                throw err;
            }   else{
                res.send("user '" + req.params.roomname + "' has been removed from the records;");
            }
        });
    });

}