var express = require('express');
var router = express.Router();

var cors = require('cors')

var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

// Needed by chrome extension to attach onto headers, otherwise cant play blobs cross origin
router.use(cors());

router.get('/', function(req, res, next) {
  //console.log("Accessing route to load user recordings. ");
  //Authenticate users session
  if(req.session.username == undefined || req.session.logged != true){
    res.redirect('/');
  }
  else{
    // Make sure they have the fresh sessionID in DB before serving personal recordings
    persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
      if(boolVal){
        dataRT.fetchRecordings(req.session.username, false, function(blobArr,blobBuffArray,username){
          res.render('recordings', { title: 'speakEZ', blobArray: blobArr, blobBuffArray: blobBuffArray});
        }); 
      }
      else{
        res.render('login', { error: 'Session expired. Please re-login.'});
      }
    });
  }
});

// API call /recordings/blobToken
router.get("/:speakEZtoken", function(req,res,next){
  dataRT.fetchRecording(req.params.speakEZtoken, function(result){
    res.send(result);
  });
});

module.exports = router;