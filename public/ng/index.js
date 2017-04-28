
//  names of dependencies go inside the array
var myApp = angular.module('boltushka',['ngRoute']);
//var socketURL = 'http://localhost:5000';
var socket;
var temp;

//  creates a socket connection based on params attached to passed service;
function initiateSocketConnection(sessionService,$scope){
    //  attempt to establish connection with specified namespace (chatroom)
    socket = io.connect(socketURL + "/" + sessionService.room,
        //  data to include with the connection
        {query:
            "handle=" + sessionService.handle
        }
        
    );

    socket.on('welcome', function(data) {
        console.log("communicating to room");
        console.log("message from server: " + data);
        //socket.emit('join', 'user connected!');
    });

    socket.on("notification",function(data){
        console.log("Notification:" + data);
    });
}

//  SPA routing and controllers
myApp.config(function($routeProvider){
    $routeProvider
    .when('/',{
        templateUrl: 'ng/views/login-box.html',
        controller: 'entryController'
    })
    .when('/chat',{
        templateUrl: 'ng/views/chat.html',
        controller: 'chatController'
    });
});

//  service that keeps track of and communicates user data between controllers.
myApp.service('sessionData',function(){
    
});


//  scrolls the current chatlog to the bottom, where the new messages are.
function scrollToBottom(){
    var objDiv = document.getElementById("chat-log");
    objDiv.scrollTop = objDiv.scrollHeight;
}

myApp.controller('chatController',["$scope","$http", "$log","$timeout","sessionData",function($scope,$http,$log,$timeout,sessionData){
    $log.log("chat controller active");
    $scope.room = sessionData.room;

    //  takes in a Unix timestamp, formats, and returns it as a string;
    $scope.formatTimestamp = function(unixMStimestamp){
        return moment(unixMStimestamp).format("HH:mm:ss");
    }

    //  stores current chat log
    $scope.messageList = [];
    
    //  set up an "on message" handler, triggered when message is reecived in chat.
    socket.on("message",function(data){
        //  wrap in apply due to interaction with $scope log
        $scope.$apply(function(){
            //  push to log and scroll it to the bottom.
            $scope.messageList.push(data);
        });
        scrollToBottom();
    });


    //  called when the user hits the "submit" button.
    $scope.messageSubmitted = function(){
        
        //  assemble data
        var data = {
            "user":"JimJim",
            "handle":sessionData.handle,
            "text":$scope.ownMessage,
             //  ms unix timestamp using Moment.js; converted to human-readable format in the chat-message directive;
            "time":Number(moment().format('x'))
        }

        //  send to server
        socket.emit("message",data);
        
        //  clear the box
        $scope.ownMessage = "";
    }

}]);

//  Model in charge of login data entry
myApp.controller('entryController',["$scope","$http", "$location","$log","sessionData",function($scope,$http,$location,$log,sessionData){
    $log.log("main controller active");
    $scope.testVar = "apple";

    //  called when the 'submit' button is pressed
    $scope.sendData = function(){
        // disable the 'submit' button
        $scope.dataSent = true;
        //  format the data
        data = {
            // "handle":$scope.handle,
            // "room":$scope.room
            "roomName":$scope.room
        }
        sessionData.room = $scope.room;
        sessionData.handle = $scope.handle;
        //  send the data
        $http.post("/chat",data)
        .then(function(result){     //  if successful response from server
            $scope.submitSuccess = true;               //  adjust UI to reflect success
            initiateSocketConnection(sessionData);     //  initiate the socket.io connection
            $location.path('/chat');
            $log.log(result);

        },function(data,status){    //  if error
            $scope.alertContent = "The server encountered an error. Please try again later."
            $scope.submitFail = true;       //  adjust UI to reflect failure
            $scope.displayAlert = true;
            $scope.dataSent = false;
            $log.log(status + ": " + data)
        });
    };


}]);


myApp.directive('entryBoxWrapper',function(){
    return {
        restrict: 'AECM',
        replace: true,
        templateUrl: 'ng/directives/login-inputs.html'
    }
});

myApp.directive('loadingBlockWrapper',function(){
    return {
        restrict: 'AECM',
        replace: true,
        templateUrl: 'ng/directives/loading.html'
    }
});

myApp.directive('chatMessage',function(){
    return {
        restrict: 'AECM',
        replace: true,
        templateUrl: 'ng/directives/chat-message.html'
    }
});

myApp.directive('chatBanner',function(){
    return {
        restrict: 'AECM',
        replace: true,
        templateUrl: 'ng/directives/chat-banner.html'
    }
});


/*
myApp.directive('someTemplate',function(){
    return {
        restrict: 'AECM',
        templateUrl: 'directives/link.html',
        replace: true,
        scope:{
            flubbaFlubba:"=",
            addressFunction:"&"
        },
        link: function(scope, elements, attrs){
            if(scope.flubbaFlubba.name==="shane"){
                elements.css("background-color","red");
            }
            console.log("Post-linking...");
            console.log(elements);
        }
    }
});
*/