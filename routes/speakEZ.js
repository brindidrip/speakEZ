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

var url = 'mongodb://domenico:default@35.185.126.172:27017/admin'

router.use(bodyParser.json({limit: "50mb"}));
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

var insertBlob = function(db, blob, user, filename, fp, callback) {
   db.collection('recordingsDB').insertOne({
      "username" : user,
      "blobToken" : filename,
      "blob" : blob
  }, function(err, result) {
    assert.equal(err, null);
      console.log("Inserted the following into recordingsDB:" +
      "\nusername: " + user +
      "\nblobToken: " + filename +
     // "\nblob: " + blob +
      "\n\nSuccessfully inserted a new blob into the recordingsDB collection.");
    
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

function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  console.log("logged in")

  res.render('speakEZ', { title: 'Google+'});
});



// Store blob data into DB
router.post('/DB', type, function(req,res,next){
  
 //var newPath =  _utils.DetermineFileName(req.file.originalname, __dirname + '/public/uploads/');
//console.log("req.file.path:" + req.file.encoding);
// Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      

    var ab = fs.readFileSync(req.file.path);
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
        
    }
        
    //TODO
    // We need to store a unique blobToken for each recording
    // Use bcrypt with a unique plaintext password
    // plaintext password could be the user_id concat with the current date of execution
    // or could be the users account_id witht he current date of execution
    // Each unique salted hash will be the entity used to link the blobData together. 
    
    // An idea: Once given a blobToken by the user instead of linearly comparing each blobToken for a match,
    // we can do index hashing for that specific field and do a constant time look up?
 
      //var encImg = newImg.toString('base64');
      //console.log(encImg);
      insertBlob(db, buf, req.session.username, req.file.filename, req.file.path, function(delFile){
        
        //Remove file from local directory once its in database.
        // Use unlinkSync since its an async db insertion func call
        fs.unlinkSync(delFile);
        
        
        var sendBack = {"blob" : buf, "blobToken" : req.file.filename};
        
        console.log(buf);

        db.close();
        res.send(sendBack);
      });
      
  });
  
});

});




module.exports = router;
