var express = require('express');
var router = express.Router();
var blobutil = require('blob-util');
let multer = require('multer');
var upload = multer({ dest: __dirname + '/temp_uploads/' });
var type = upload.single('upl');
var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var persist = require('../public/javascripts/modules/persistency.js');

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
      /*
      console.log("Inserted the following into recordingsDB:" +
      "\nusername: " + user +
      "\nblobToken: " + filename +
     // "\nblob: " + blob +
      "\n\nSuccessfully inserted a new blob into the recordingsDB collection.");
      */
    
    callback(fp);
  });
  
};


function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}


router.post('/profile-change',  function(req,res,next){
  // Authenticate password
  persist.comparePass(req.session.username, req.body.current_password, req, res, function(info, boolVal){
    if(boolVal){
      // Sanitize user inputs
      dataRT.updateProfile(req.session.username,req.body.email, function(email){
        // update session variables
        req.session.email = email;
        res.redirect('/home');
      });
    }
    else{
      res.render('profile', { session: req.session, error: "Invalid password, try again."});
    }
});
});


router.post('/delete',  function(req,res,next){
  dataRT.deleteRecording(req.body.speakEZtoken);
  res.send("Success");
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
