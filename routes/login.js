//login.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

router.use(bodyParser.json());

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'speakEZ', error: ''});
});

router.post('/', function(req,res,next){
  var username = req.body.username;
  var password = req.body.password;

  // Debug
  // console.log("login.js, router.post('/'): Attempting to compare pass and username: " + username + ":" + password);
  
  persist.comparePass(username, password, req, res, function(sessionHash, info, success){
    if(success){
      // Debug
      // console.log("login.js, router.post('/'): Compare successful. infoUser: " + Object.getOwnPropertyNames(info));

      req.session.loginID = sessionHash;
      req.session.username = username;
      req.session.biodata = info['bio-data'];
      req.session.email = info.emailAddress;

      res.redirect('/home'); 
    }
    else{
  
      // Debug
      // console.log("login.js, router.post('/'): Compare failure.");

      res.render('login', { title: 'speakEZ', error: 'Login failed, try again.'});
    }
  })
});

module.exports = router;