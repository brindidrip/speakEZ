//persistency.js
var assert = require('assert');
var dataRT = require('./dataRetrieval.js');

exports.auth = function(req, res, next) {
	//console.log("Trying to authenticate user now");
	//console.log("authenticating: " + req.session.username + "with" + req.session.loginID );
	var authenticationBoolean = AuthenticateUser(req.session.loginID, req.session.username);
  
	//console.log("Authentication boolean: " + authenticationBoolean);
  
	if (authenticationBoolean === true){
    	console.log("Authentication Success!");
    	//return next();
  	} 
	else{
    	console.log("Authentication failed!");
		//return res.sendStatus(401);}
	}
};

exports.AuthenticateUser = function(sessionCookie, sessionUser, callback) {
	var infoUser = null;
	// Connect to DB
	dataRT.MongoClient.connect(dataRT.url, function(err, db) {
		assert.equal(null, err);
		console.log("persistency.js, fn(AuthenticateUser): connected to db");
  
		// Authenticate
    	db.authenticate('domenico', 'default', function(err, result) {
			assert.equal(true, result);
			console.log("persistency.js, fn(AuthenticateUser): authenticated into db");
      
			db.collection('sessionDB').findOne({'username': sessionUser}, function (findErr, result) {
				if (findErr) throw findErr;

				infoUser = result;
				db.close();
     
				console.log("persistency.js, fn(AuthenticateUser): Comparing session cookie:  " + sessionCookie + " with sessionID stored in db: " + infoUser.current_sessionID
					+ "from user record: " + infoUser);
				
				if(infoUser.current_sessionID == sessionCookie){
					console.log("persistency.js, fn(AuthenticateUser): current session cookie and stored sessionID match\n");
					callback(true);
				}
				else{
					console.log("persistency.js, fn(AuthenticateUser): Could not authenticate session, did not match\n");
					callback(false);
				}
			});
		});
    });
}