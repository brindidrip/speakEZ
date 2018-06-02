var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mongodb = require('mongodb');


var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://domenico:default@35.185.126.172:27017/admin'

    
router.use(bodyParser.json());


function updateDoc(user, sessionPass){
    // Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
        db.collection('sessionDB').updateOne({'username': user}, {$set: {current_sessionID: sessionPass}});
          db.close();

    });
});

}

function comparePass(user, password, req, res, callback) {
   var infoUser = 0;
    // Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      
    db.collection('userDB').findOne({'username': user}, function (findErr, result) {
          if (findErr) throw findErr;

    infoUser = result;
    console.log(result.username);
    db.close();
  


    console.log("Now trying to compare password with bcrypt");
    //Load hash from your password DB.
    console.log("We are comparing:" + password + " and " + infoUser.hashedPass);
    bcrypt.compare(password, infoUser.hashedPass, function(err, res) {
        console.log("Inside bcrypt compare func");
        // If success redirect to homepage
        
         if(res){
           console.log("Successful compare");
           // Generate a sessionID for the user
           
          // Login Success
          // Set session username
         bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(user, salt, function(err, hash) {
          // update user's doc with the new sessionID
            updateDoc(user,hash);

              console.log("Setting session id: " + hash + " for " + user);
              req.session.loginID = hash;
              req.session.username = user;
              console.log("Set session: " + req.session.loginID + " for " + req.session.username)
              

              console.log("Updating session id for user: " + req.session.username);
                callback(hash, true);
              });
            });
         }
         else{
                      console.log("Compare failed");
                      callback(0, false)  
                    
         }

    });
    });
    });
});}



/* GET login page. */
router.get('/', function(req, res, next) {
  console.log("At login")

  res.render('login', { title: 'speakEZ'});
});

/* GET login fail page. */
router.get('/incorrect', function(req, res, next) {

  res.render('login_fail', { title: 'speakEZ'});
});




router.post('/', function(req,res,next){

var username = req.body.username;
var password = req.body.password;

console.log("Attempting to compare pass and username: " + username + ":" + password);

//xim(username)
// Either redirects to failure or success
  comparePass(username, password, req, res, function(sessionHash, boolVal){
      if(boolVal){
         req.session.loginID = sessionHash;
        req.session.username = username;
        res.redirect('/recordings/home/' + username) 
      }
      else{
          res.redirect('/login/incorrect');
      }
  })


});


module.exports = router;
