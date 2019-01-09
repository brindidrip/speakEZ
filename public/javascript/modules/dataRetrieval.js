//dataRetrieval.js
var assert = require('assert');

exports.MongoClient = require('mongodb').MongoClient;
exports.url = 'mongodb://domenico:default@34.73.148.57:27017/admin'

exports.updateProfile = function(user, email, callback){
	//TODO sanitize
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
};

exports.lookupUser = function(user, callback){
	exports.MongoClient.connect(exports.url, function(err,db){
		assert.equal(null,err);

		db.authenticate('domenico', 'default', function(err,result){
			assert.equal(true, result);

			db.collection('userDB').findOne({'username': user}, function (findErr, result) {
        		if (findErr) throw findErr;

        		// Check if user document already exists in DB,
        		if (result == null){
        			callback(true);
        		}
        		else{
        			callback(false);
        		}
        		db.close();

	});
});
});
};

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
				callback(result);    
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
            //console.log(err);
            db.close();

            // fetch recordings from oldest to newest
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