//index.js
var express = require('express');
var router = express.Router();
var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("loaded index");
  console.log("username: " + req.session.username);

  if(req.session.username == undefined){
  	    	res.render('index', { title: "SpeakEZ"});

  }
  else{
  persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
    if(boolVal){
      //console.log("Now logged in");
      res.redirect('/home');
    }
    else{
    	res.render('index', { title: "SpeakEZ"});
    }
});
}
});



router.get('/home', function(req, res, next) {
	if(req.session.username == undefined){
		res.redirect('/');
	}
	else{
	persist.AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){
		if(boolVal){
		//console.log("Now logged in");
		res.render('speakEZ', { title: 'Google+'});
		}
		else{
		//TODO 
		//consider changing to redirect because rendering with this router will keep the /home/admin url
		res.render('login', { error: 'Session expired. Please re-login.'});
	} 
});
}
});


router.get('/recording/:blobID', function(req, res, next) {
// check if blobID is password protected
// if so, then bcryt compare
dataRT.fetchRecording(req.params.blobID, function(result){
	console.log(dataRT);

  //});

  //res.render('recording');

});
});

module.exports = router;
