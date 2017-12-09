var express = require('express');
var router = express.Router();
var blobutil = require('blob-util');
let multer = require('multer');
var upload = multer({ dest: __dirname + '/temp_uploads/' });
var type = upload.single('upl');

const mongodb = require('mongodb');

var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
var saltRounds = 10;
    
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');

var url = 'mongodb://domenico:default@35.196.154.162:27017/admin'


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true,limit: '50mb' }));


var insertBlob = function(db, blob, user, filename, fp, callback) {
   db.collection('recordingsDB').insertOne({
      "username" : user,
      "blobToken" : filename,
      "blob" : Buffer(blob, 'base64')
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a new blob into the recordingsDB collection.");
    callback(fp);
  });
  
};


// Authentication and Authorization Middleware
function auth(req, res, next) {
  
  console.log("Trying to authenticate user now");
  console.log("authenticating: " + req.session.username + "with" + req.session.loginID );
  var authenticationBoolean= AuthenticateUser(req.session.loginID, req.session.username);
  
  console.log("Authentication boolean: " + authenticationBoolean);
  
  if (authenticationBoolean === true){
    console.log("Authentication Success!");
    //return next();
  } 
  else{
    console.log("Authentication failed!");
    //return res.sendStatus(401);}
  }
};


// Authentication helper
function AuthenticateUser(sessionCookie, sessionUser, callback) {
  var infoUser = 0;
    // Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      
    db.collection('sessionDB').findOne({'username': sessionUser}, function (findErr, result) {
          if (findErr) throw findErr;

    infoUser = result;
    db.close();
     
        console.log("Comparing:  " + sessionCookie + " with " + infoUser.current_sessionID);
  if(infoUser.current_sessionID == sessionCookie){
    console.log("We are in the right session");
    callback(true);}
 else{
    console.log("Could not authenticate session");
    callback(false);
    
  }
  
});
});
});
}
/* GET home page. */
router.get('/', auth, function(req, res, next) {

  res.render('speakEZ', { title: 'Google+'});
});

router.get('/:uniqueID', function(req, res, next) {

AuthenticateUser(req.session.loginID, req.session.username, function(boolVal){

   if(boolVal){
      res.render('speakEZ', { title: 'Google+'});
   }
   else{
     res.render('/login', { title: 'Google+'});
   }
   
});



});


router.post('/DB', type, function(req,res,next){
  
 //var newPath =  _utils.DetermineFileName(req.file.originalname, __dirname + '/public/uploads/');
 console.log(req.file.path);
  
// Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      var newImg = fs.readFileSync(req.file.path);
      var encImg = newImg.toString('base64');
//console.log(encImg);
      insertBlob(db,encImg, req.session.username, req.file.filename, req.file.path, function(delFile){
        
        fs.unlinkSync(delFile);
        var sendBack = {"blob" : newImg, "blobToken" : req.file.filename};
        db.close();
        res.send(sendBack);
      });
      
  });
  
});

});




module.exports = router;
