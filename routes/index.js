var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("loaded index")

  res.render('index', { title: "SpeakEZ"});
});


router.get('/recording/:blobID', function(req, res, next) {

// check if blobID is password protected
// if so, then bcryt compare

  res.render('recording');

});
module.exports = router;
