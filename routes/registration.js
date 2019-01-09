//registration.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var sanitizer = require('sanitize')();

var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

// Modules
var dataRT = require('../public/javascript/modules/dataRetrieval.js');
var dataIN = require('../public/javascript/modules/dataInsertion.js');
var persist = require('../public/javascript/modules/persistency.js');
    
router.use(bodyParser.json());

var sanitizeReg = function(req, cb){
    //Sanitize username, name and email
    //TODO 
    //var sanitizerUser = sanitizer.value(req.body.user_reg, "str");

    dataRT.lookupUser(req.body.user_reg, function(res){
        cb(res);
    });
  }

/* GET registration page. */
router.get('/', function(req, res, next) {

  res.render('registration', { error: '' });
});

/* POST registration page. */
router.post('/', function(req,res,next){
  
  persist.connectDB(function(db){
  
  // Hash user password
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {

        /* debug
          insertUserDebug(db,req,hash, function(){
            res.redirect("/registration");
            })
        */

      sanitizeReg(req, function(success){
        if(success){
          dataIN.insertUser(db, req, hash, function(){
            dataIN.insertUserSession(db, req, function() {
              db.close();
              res.redirect("/login");
            });
          });
        }
        // redirect back to /registration since user already exists or sanitization failed
        else{
          res.render('registration', { error: "User already exists"});
        }
      });
  });
  }); 
});
});

module.exports = router;