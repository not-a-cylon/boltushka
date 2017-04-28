var Users = require('../models/userModel');
var bodyParser = require('body-parser');

//  checks to see if the specified user exists; returns boolean accordingly
function userExists(username){
    var result = true;
    Users.count(
        {"username":username},
        function(err,count){
            if(err) throw err
            result = (count > 0);
        }
    )
    return result;
}

module.exports = function(app){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded(  {extended:true} ));

    app.post("/api/test",function(req,res){
        res.send("Handle: " + req.body.handle + "; Room: " + req.body.room);
    });

    //  creates a new user
    app.post("/api/create",function(req,res){
        var newUser = Users({
            username: req.body.username,
            IP: req.connection.remoteAddress
        });
        newUser.save(newUser,function(err,result){
            if(err) throw err;
            res.send('Success');
        });
    });

    //  view a user's information;
    //  if no uname is specified, prints all existing users;
    app.get("/api/view/:uname",function(req,res){
        uname = req.params.uname;
        res.setHeader('content-type','text/html');  //  otherwise console shows warning for returning json obj
        Users.find({ username: uname },function(err,userInfo){
            if(err) throw err;
            res.send(userInfo);
        });
    });

    //  displays the info associated with all users
    app.get("/api/viewall",function(req,res){
        res.setHeader('content-type','text/html');  //  otherwise console shows warning for returning json obj
        res.write("Displaying all users: <br/>");
        Users.find({},function(err,users){
            users.forEach(function(elem){
                res.write(elem.toString());
                res.write("<br />");
            });
        });
    });

    //  officially removes a user's info from the database;
    app.delete("/api/:uname",function(req,res){
        Users.remove({ username: req.params.uname },function(err){
            if(err){
                console.log("encountered error while removing user " + req.params.uname);
                throw err;
            }   else{
                res.send("user '" + req.params.uname + "' has been removed from the records;");
            }
        });
    });

    app.get("/test",function(req,res){
        console.log(req.connection.remoteAddress);
        res.send(req.url);
    });
}