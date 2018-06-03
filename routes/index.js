//index.js
var express = require('express');
var router = express.Router();
var dataRT = require('../public/javascripts/modules/dataRetrieval.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("loaded index")

  res.render('index', { title: "SpeakEZ"});
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
