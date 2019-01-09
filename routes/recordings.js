//recordings.js
var express = require('express');
var router = express.Router();

var cors = require('cors')

var dataRT = require('../public/javascript/modules/dataRetrieval.js');
var persist = require('../public/javascript/modules/persistency.js');

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
    //persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
     // if(boolVal){
        // check if blobArray and blobBuffArray are cached first in redis
        // if not, then go retrieve again and store in session cache
        // if(req.session.blobBuffArray == undefined || req.session.blobArray == undefined){
          dataRT.fetchRecordings(req.session.username, false, function(blobArr,blobBuffArray,username){
            //req.session.blobArray = blobArr;
            //req.session.blobBuffArray = blobBuffArray;
            res.render('recordings', { title: 'speakEZ', blobArray: blobArr, blobBuffArray: blobBuffArray});
            
          });
       // }
       // else{
       //   console.log("using cached version")
       //   res.render('recordings', { title: 'speakEZ', blobArray: req.session.blobArray, blobBuffArray: req.session.blobBuffArray});
       // }
      }
      //else{
      //  res.render('login', { error: 'Session expired. Please re-login.'});
      //}
    });
//  }
//});

// Individual recording page
router.get('/a/:speakEZtoken', function(req, res, next) {
  // check if blobID is password protected
  // if so, then bcryt compare
  dataRT.fetchRecording(req.params.speakEZtoken, function(result){
    res.render('recording', {result: result}); // with the result
  });
});

// API call /recordings/blobToken to be used with chrome extension
router.get("/:speakEZtoken", function(req,res,next){
  dataRT.fetchRecording(req.params.speakEZtoken, function(result){
    res.send(result);
  });
});

module.exports = router;