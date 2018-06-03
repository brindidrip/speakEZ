var express = require('express');
var router = express.Router();
var blobutil = require('blob-util');
let multer = require('multer');
var upload = multer({ dest: __dirname + '/temp_uploads/' });
var type = upload.single('upl');
var cors = require('cors')

var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

const mongodb = require('mongodb');

var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));

router.use(cors());

router.get('/', function(req, res, next) {
  //console.log("Accessing route to load user recordings. ");
  //Authenticate users session
  persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
    if(boolVal){
      dataRT.fetchRecordings(req.session.username, function(blobArr,blobBuffArray,username){
        res.render('recordings', { title: 'speakEZ', blobArray: blobArr, blobBuffArray: blobBuffArray});
      }); 
    }
    else{
      res.render('login', { title: 'speakEZ'});
    }
  });
});

router.get('/home/:uniqueID', function(req, res, next) {
  persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
    if(boolVal){
      //console.log("Now logged in");
      res.render('speakEZ', { title: 'Google+'});
    }
    else{
      //TODO 
      // consider changing to redirect because rendering with this router will keep the /home/admin url
      res.render('login', { error: 'Session expired. Please re-login.'});
    } 
  });
});

router.get("/:speakEZtoken", function(req,res,next){
  dataRT.fetchRecording(req.params.speakEZtoken, function(result){
    res.send(result);
  });
});

module.exports = router;