//dataRetrieval.js
var assert = require('assert');

exports.MongoClient = require('mongodb').MongoClient;
exports.url = 'mongodb://domenico:default@35.185.126.172:27017/admin'

exports.updateProfile = function(user, email, callback){
	exports.MongoClient.connect(exports.url, function(err,db){
		assert.equal(null,err);

		db.authenticate('domenico', 'default', function(err,result){
			assert.equal(true, result);
			// TODO
			// should use hashed pass to find document
      		db.collection('userDB').updateOne({'username': user}, {$set: {emailAddress: email}});

				db.close();
				callback(email);
			});
		});
	//});
}

exports.deleteRecording = function(spEZtoken){
	exports.MongoClient.connect(exports.url, function(err,db){
		assert.equal(null,err);

		db.authenticate('domenico', 'default', function(err,result){
			assert.equal(true, result);

			db.collection('recordingsDB').deleteOne({ "blobToken" : spEZtoken }, function(findErr,result){
				if (findErr) throw findErr;

				db.close();
			});
		});
	});
};

exports.fetchRecording = function(spEZtoken, callback) {
	// Connect to DB
	exports.MongoClient.connect(exports.url, function(err, db) {
    	assert.equal(null, err);
    	
    	// Authenticate
    	db.authenticate('domenico', 'default', function(err, result) {
      		assert.equal(true, result);
        
      		db.collection('recordingsDB').findOne({'blobToken': spEZtoken}, function (findErr, result) {
        		if (findErr) throw findErr;

        		if(result.blobToken == undefined){
          			console.log("blobToken issue");
        			}

				db.close();
				callback(result.blob);    
			})          
		});
	});
};

    
exports.fetchRecordings = function(username, reverse, callback){
	exports.MongoClient.connect(exports.url, function(err, db) {
		assert.equal(null, err);
  
		// Authenticate
		db.authenticate('domenico', 'default', function(err, result) {
		assert.equal(true, result);
      
		db.collection('recordingsDB').find({'username': username}, function (findErr, result) {
    
		if (findErr) throw findErr;

		var blobArray = [];
		var blobBufferArray = [];
		result.forEach(function(result){

		if(result.blobToken == undefined){
        	console.log("blobToken issue");
        	}
      
		else{
			//below will be on frontend to load blob
			//var storedBlob = new Blob([ab], {type: 'audio/wav'});

			blobArray.push(result);
			blobBufferArray.push(result.blob.buffer);
			//console.log("Length:" + blobArray.length);

              }
            }, function(err) {
            console.log(err);
            db.close();
            if (reverse){
            	callback(blobArray.reverse(),blobBufferArray.reverse(),username);
            }
            else{
            	callback(blobArray,blobBufferArray,username);
            }
        	});
    	});
	});
});
};

