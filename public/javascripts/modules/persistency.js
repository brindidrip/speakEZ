//persistency.js
var dataRT = require('./dataRetrieval.js');

var assert = require('assert');
var bcrypt = require('bcrypt');
var saltRounds = 10;


exports.comparePass = function(user, password, req, res, callback) {
  var infoUser = null;

  dataRT.MongoClient.connect(dataRT.url, function(err, db) {
    assert.equal(null, err);
    //console.log("login.js, fn(comparePass): connected to db.");

    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
      //console.log("login.js, fn(comparePass): authenticated to db. \n");
      
      db.collection('userDB').findOne({'username': user}, function (findErr, result) {
        if (findErr) throw findErr;

        if (result == null){
          infoUser = 0;
          infoUser.hashedPass = 0;}
        else{
          infoUser = result;}
        db.close();

        //console.log("login.js, fn(comparePass): Comparing stored password with entered pass using bcrypt." + 
        //  "Comparing entered password: " + password + " and stored user password: " + infoUser.hashedPass + "\n");

        bcrypt.compare(password, infoUser.hashedPass, function(err, res) {
          //console.log("login.js, fn(comparePass): Inside bcrypt.\n");        

          if(res){
            console.log("login.js, fn(comparePass): Successful compare");
	       callback(infoUser, true);


          }
          else{
            console.log("login.js, fn(comparePass): Compare failed: " + res);
            req.session.logged = false;
            callback(null, false);
          }
        });
      });
    });
  });
}


exports.auth = function(req, res, next) {
	////console.log("Trying to authenticate user now");
	////console.log("authenticating: " + req.session.username + "with" + req.session.loginID );
	var authenticationBoolean = AuthenticateUser(req.session.loginID, req.session.username);
  
	////console.log("Authentication boolean: " + authenticationBoolean);
  
	if (authenticationBoolean === true){
    	//console.log("Authentication Success!");
    	//return next();
  	} 
	else{
    	//console.log("Authentication failed!");
		//return res.sendStatus(401);}
	}
};

exports.AuthenticateUser = function(sessionCookie, sessionUser, callback) {
	var infoUser = null;
	// Connect to DB
	dataRT.MongoClient.connect(dataRT.url, function(err, db) {
		assert.equal(null, err);
		//console.log("persistency.js, fn(AuthenticateUser): connected to db");
  
		// Authenticate
    	db.authenticate('domenico', 'default', function(err, result) {
			assert.equal(true, result);
			//console.log("persistency.js, fn(AuthenticateUser): authenticated into db");
      
			db.collection('sessionDB').findOne({'username': sessionUser}, function (findErr, result) {
				if (findErr) throw findErr;

				infoUser = result;
				db.close();
     
				//console.log("persistency.js, fn(AuthenticateUser): Comparing session cookie:  " + sessionCookie + " with sessionID stored in db: " + infoUser.current_sessionID
				//	+ "from user record: " + infoUser);
				
				if(infoUser.current_sessionID == sessionCookie){
					//console.log("persistency.js, fn(AuthenticateUser): current session cookie and stored sessionID match\n");
					callback(true);
				}
				else{
					//console.log("persistency.js, fn(AuthenticateUser): Could not authenticate session, did not match\n");
					callback(false);
				}
			});
		});
    });
}