//dataInsertion.js
var assert = require('assert');

exports.MongoClient = require('mongodb').MongoClient;
exports.url = 'mongodb://domenico:default@34.73.148.57:27017/admin'

exports.insertUser = function(db, req, hash, callback) {
  var today = new Date();
   db.collection('userDB').insertOne( {
      "bio-data" : {
         "fullName" : req.body.firstName + " " + req.body.lastName, 
         "country" : req.body.country,
         "birthdate" :  req.body.dobMonth + req.body.dobDay + req.body.dobYear,
         "creation" : (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear(),
         "membership" : false
      },
      "username" : req.body.user_reg,
      "emailAddress" : req.body.emailAddress,
      "hashedPass" : hash
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a user_document into the userDB collection.");
    callback();
  });
};

exports.insertUserDebug = function(db, req, hash, callback){
    console.log("Inserting this recording into the collection userDB:" +
    "\nfullName: " + req.body.firstName + " " + req.body.lastName +
    "\ncountry: " + req.body.country +
    "\nbirthDate: " + req.body.dobMonth + "/" + req.body.dobDay + "/" + req.body.dobYear + 
    "\nusername: " + req.body.user_reg +
    "\nemailAddress: " + req.body.emailAddress +
    "\nhashedPass: " + hash);
    
    console.log("Inserting " + req.body.user_reg + "'s user session into the sessionDB collection" +
    "\ncurrent_sessionID: " + 0);
    callback();
};

exports.insertUserSession = function(db, req, callback) {
   db.collection('sessionDB').insertOne({
      "username" : req.body.user_reg,
      "current_sessionID" : 0
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a user session into the sessionDB collection.");
    callback();
  }); 
};

exports.insertBlob = function(db, blob, user, filename, title, desc, date, fp, callback) {
   db.collection('recordingsDB').insertOne({
      "username" : user,
      "blobToken" : filename,
      "title" : title,
      "description": desc,
      "recordDate": date,
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
