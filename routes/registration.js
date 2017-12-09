var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://35.196.154.162:27017/admin'
    
router.use(bodyParser.json());

var insertUser = function(db, req, hash, callback) {
   db.collection('userDB').insertOne( {
      "bio-data" : {
         "fullName" : req.body.firstName + " " + req.body.lastName, 
         "country" : "USA",
         "birthdate" :  req.body.dobYear,
         "membership" : false
      },
      "username" : req.body.user_reg,
      "emailAddress" : req.body.emailAddress,
      "hashedPass" : hash
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a user_document into the userDB collection.");
    callback();
  });
  
};

var insertUserSession = function(db, req, callback) {
   db.collection('sessionDB').insertOne({
      "username" : req.body.user_reg,
      "current_sessionID" : '0'
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a user session into the sessionDB collection.");
    callback();
  });
  
};
  

/* GET registration page. */
router.get('/', function(req, res, next) {

  res.render('registration', { title: 'Google+'});
});

router.post('/', function(req,res,next){

// Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);

    });
    

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        insertUser(db, req, hash, function(){
            insertUserSession(db,req,function() {
                db.close();
            
                res.redirect("/login");
            })
       
            
        })
         
        })
    });
    
    
   
});


});
module.exports = router;