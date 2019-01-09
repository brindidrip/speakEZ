//index.js
var express = require('express');
var router = express.Router();

var dataRT = require('../public/javascript/modules/dataRetrieval.js');
var persist = require('../public/javascript/modules/persistency.js');

/* GET home page. */
router.get('/', function(req, res, next) {

	if(req.session == undefined || (req.session.username == undefined && req.session.logged != true)){
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
      // TODO
    	// Make sure they have the fresh sessionID in DB before serving personal recordings
    	// persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
      //		if(boolVal){
      			dataRT.fetchRecordings(req.session.username, true, function(blobArr,blobBuffArray,username){
              //console.log(req.session.username + '\nblobArr: ' + blobArr + '\nblobBuffArray: ' + blobBuffArray + '\nusername: ' + username);
          		res.render('speakEZ', { session: req.session, blobArray: blobArr, blobBuffArray: blobBuffArray});
        	}); 
      //  	}
      //  	else{
      //  		res.render('login', { error: 'Session expired. Please re-login.'});
      //  	}
      //  });
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
          		res.render('profile', { session: req.session, error: "", blobArray: blobArr, blobBuffArray: blobBuffArray});
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

module.exports = router;