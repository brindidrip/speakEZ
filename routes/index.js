//index.js
var express = require('express');
var router = express.Router();

var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.username == undefined && req.session.logged != true){
		res.render('index', { title: "SpeakEZ"});
  	}
  	else{
  		res.redirect('/home');
  	}
  });


router.get('/home', function(req, res, next) {
	if(req.session.username == undefined || req.session.logged != true){
		res.render('login', { error: 'Session expired. Please re-login.'});
	}
	else{
    	// Make sure they have the fresh sessionID in DB before serving personal recordings
    	persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
      		if(boolVal){
      			dataRT.fetchRecordings(req.session.username, true, function(blobArr,blobBuffArray,username){
          		res.render('speakEZ', { session: req.session, blobArray: blobArr, blobBuffArray: blobBuffArray});
        	}); 
        	}
        	else{
        		res.render('login', { error: 'Session expired. Please re-login.'});
        	}
        });
    }
});

router.get('/home/settings', function(req, res, next) {
	if(req.session.username == undefined || req.session.logged != true){
		res.render('login', { error: 'Session expired. Please re-login.'});
	}
	else{
    	// Make sure they have the fresh sessionID in DB before serving personal recordings
    	persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
      		if(boolVal){
      			dataRT.fetchRecordings(req.session.username, true, function(blobArr,blobBuffArray,username){
          		res.render('profile', { session: req.session, blobArray: blobArr, blobBuffArray: blobBuffArray});
        	}); 
        	}
        	else{
        		res.render('login', { error: 'Session expired. Please re-login.'});
        	}
        });
    }
});




router.get('/logout', function(req, res, next) {
	req.session.destroy();
	res.redirect('/');

});


router.get('/recording/:blobID', function(req, res, next) {
	// check if blobID is password protected
	// if so, then bcryt compare
	dataRT.fetchRecording(req.params.blobID, function(result){
		res.render('recording') // with the result
	});
});

module.exports = router;