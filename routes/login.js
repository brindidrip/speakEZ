var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const mongodb = require('mongodb');

var bcrypt = require('bcrypt');
var saltRounds = 10;

var dataRT = require('../public/javascripts/modules/dataRetrieval.js');

var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
    
router.use(bodyParser.json());

function updateSessionID(user, sessionPass, callback){
  dataRT.MongoClient.connect(dataRT.url, function(err, db) {
    assert.equal(null, err);
    //console.log("login.js, fn(updateSessionID): connected to db.");

    //Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      //console.log("login.js, fn(updateSessionID): authenticated to db.\n");

      db.collection('sessionDB').updateOne({'username': user}, {$set: {current_sessionID: sessionPass}});
      db.close();
      callback();
    });
  });
}

function comparePass(user, password, req, res, callback) {
  var infoUser = null;

  dataRT.MongoClient.connect(dataRT.url, function(err, db) {
    assert.equal(null, err);
    //console.log("login.js, fn(comparePass): connected to db.");

    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      //console.log("login.js, fn(comparePass): authenticated to db. \n");
      
      db.collection('userDB').findOne({'username': user}, function (findErr, result) {
        if (findErr) throw findErr;

        infoUser = result;
        db.close();

        //console.log("login.js, fn(comparePass): Comparing stored password with entered pass using bcrypt." + 
        //  "Comparing entered password: " + password + " and stored user password: " + infoUser.hashedPass + "\n");

        bcrypt.compare(password, infoUser.hashedPass, function(err, res) {
          //console.log("login.js, fn(comparePass): Inside bcrypt.\n");        

          if(res){
            //console.log("login.js, fn(comparePass): Successful compare");
            // Generate a sessionID for the user
            // Set session username

            bcrypt.genSalt(saltRounds, function(err, salt) {
              bcrypt.hash(user, salt, function(err, hash) {
                //update user's doc with the new sessionID
                updateSessionID(user,hash,function(){
                  //console.log("login.js, fn(comparePass): Setting sessionID: " + hash + " for user: " + user);
                  req.session.loginID = hash;
                  req.session.username = user;
                  req.session.logged = true;
                  //console.log("login.js, fn(comparePass): Set sessionID: " + req.session.loginID + " for user: " + req.session.username)
                  //console.log("login.js, fn(comparePass): Updating session id for user: " + req.session.username + "\n");
                  callback(hash, infoUser, true);
                });
              });
            });
          }
          else{
            //console.log("login.js, fn(comparePass): Compare failed: " + res);
            req.session.logged = false;
            callback(null, false);
          }
        });
      });
    });
  });
}

/* GET login page. */
router.get('/', function(req, res, next) {
  //console.log("At login")
  res.render('login', { title: 'speakEZ', error: ''});
});

/* GET login fail page. */
router.get('/incorrect', function(req, res, next) {
  res.render('login_fail', { title: 'speakEZ'});
});

router.post('/', function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;

  //console.log("login.js, router.post('/'): Attempting to compare pass and username: " + username + ":" + password);
  
  comparePass(username, password, req, res, function(sessionHash, info, boolVal){
    if(boolVal){
      //console.log("login.js, router.post('/'): Compare successful. infoUser: " + Object.getOwnPropertyNames(info));

      req.session.loginID = sessionHash;
      req.session.username = username;
      req.session.biodata = info['bio-data'];
      req.session.email = info.emailAddress;

      res.redirect('/home'); 
    }
    else{
      //console.log("login.js, router.post('/'): Compare failure.");
      res.redirect('/login/incorrect');
    }
  })
});

module.exports = router;