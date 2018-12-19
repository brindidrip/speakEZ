//speakEZ.js
var express = require('express');
var router = express.Router();

var blobutil = require('blob-util');
let multer = require('multer');
var upload = multer({ dest: __dirname + '/temp_uploads/' });
var type = upload.single('upl');


var bodyParser = require('body-parser');

var bcrypt = require('bcrypt');
var saltRounds = 10;

// Modules
var dataRT = require('../public/javascripts/modules/dataRetrieval.js');
var dataIN = require('../public/javascripts/modules/dataInsertion.js');
var persist = require('../public/javascripts/modules/persistency.js');

var fs = require('fs');

router.use(bodyParser.json({limit: "50mb"}));
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

function toBuffer(ab) {
  var buf = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);

  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

router.post('/profile-change',  function(req,res,next){
  persist.comparePass(req.session.username, req.body.current_password, req, res, function(info, success){
    if(success){
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
  /* Debug
  var newPath =  _utils.DetermineFileName(req.file.originalname, __dirname + '/public/uploads/');
  console.log("req.file.path:" + req.file.encoding);
  */

  // TODO
  // Sanitize user input for title and description

  persist.connectDB(function(db){

    var ab = fs.readFileSync(req.file.path);
    var buf = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
        
    }
        
      // TODO
      // Need to store a unique blobToken for each recording
      // Use bcrypt with a unique plaintext password
      // plaintext password could be the user_id concat with the current date of execution
      // or could be the users account_id witht he current date of execution
      // Each unique salted hash will be the entity used to link the blobData together. 
      
      // An idea: Once given a blobToken by the user instead of linearly comparing each blobToken for a match,
      // we can do index hashing for that specific field and do a constant time look up?
 
      //var encImg = newImg.toString('base64');
      //console.log(encImg);
    dataIN.insertBlob(db, buf, req.session.username, req.file.filename, req.body.title, req.body.description, req.file.path, function(delFile){
      // Remove file from local directory once its in database.
      // Use unlinkSync since its an async db insertion func call
      fs.unlinkSync(delFile);

      var sendBack = {"blob" : buf, "blobToken" : req.file.filename};
      //console.log(buf);
      db.close();
      res.send(sendBack);
      }); 
  });
});

module.exports = router;