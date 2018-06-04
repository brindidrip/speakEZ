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
		res.render('speakEZ', { title: 'Google+'});
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