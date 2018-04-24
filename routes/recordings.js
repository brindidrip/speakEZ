var express = require('express');
var router = express.Router();
var blobutil = require('blob-util');
let multer = require('multer');
var upload = multer({ dest: __dirname + '/temp_uploads/' });
var type = upload.single('upl');

const mongodb = require('mongodb');

var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');

var url = 'mongodb://domenico:default@35.185.126.172:27017/admin'


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));


function fetchRecording(spEZtoken, callback) {

// Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      
    db.collection('recordingsDB').findOne({'blobToken': spEZtoken}, function (findErr, result) {
          if (findErr) throw findErr;

    db.close();
    
    callback(result);
        
        
})
        
    });
});

}

    
function fetchRecordings(username, callback){
    MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      
    db.collection('recordingsDB').find({'username': username}, function (findErr, result) {
          if (findErr) throw findErr;

    var blobArray = [];
    result.forEach(function(result){

            if(result.blobToken == undefined){
                
            }
            else{
                 blobArray.push(result);
                 //console.log("Length:" + blobArray.length);
            }
          }, function(err) {
    
    console.log(blobArray.length);
    db.close();
    callback(blobArray,username);});
    

    });
});

});
}

// Authentication and Authorization Middleware
function auth(req, res, next) {
  
  console.log("Trying to authenticate user now");
  console.log("authenticating: " + req.session.username + "with" + req.session.loginID );
  var authenticationBoolean= AuthenticateUser(req.session.loginID, req.session.username);
  
  console.log("Authentication boolean: " + authenticationBoolean);
  
  if (authenticationBoolean === true){
    console.log("Authentication Success!");
    //return next();
  } 
  else{
    console.log("Authentication failed!");
    //return res.sendStatus(401);}
  }
};


// Authentication helper
function AuthenticateUser(sessionCookie, sessionUser, callback) {
  var infoUser = 0;
   // Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      
    db.collection('sessionDB').findOne({'username': sessionUser}, function (findErr, result) {
          if (findErr) throw findErr;

    infoUser = result;
    db.close();
     
        console.log("Comparing:  " + sessionCookie + " with " + infoUser.current_sessionID);
  if(infoUser.current_sessionID == sessionCookie){
    console.log("We are in the right session");
    callback(true);}
 else{
    console.log("Could not authenticate session");
    callback(false);
    
  }
  
});
});
});
}


router.get('/', function(req, res, next) {
console.log("We otu here");

AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){

   if(boolVal){
      fetchRecordings(req.session.username, function(blobArr,username ){

            
            //console.log(resultQuery);          
            res.render('recordings', { title: 'speakEZ', blobArray: blobArr});

      }); 
   }
   else{
     res.render('login', { title: 'speakEZ'});
   }
   

});
});


router.get('/home/:uniqueID', function(req, res, next) {

AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){

   if(boolVal){
     console.log("Now logged in")
      res.render('speakEZ', { title: 'Google+'});
   }
   else{
     res.render('/login', { title: 'Google+'});
   }
   
});


});

// Unfinished API

router.get("/:speakEZtoken", function(req,res,next){
   
  fetchRecording(req.params.speakEZtoken, function(result){
       res.send(result.blob);
  });
    
    
    
});


module.exports = router;