# speakEZ
Final Project
netid: dmarti70

Idea (tl;dr)
=================================================================================

The application exists to make sharing audio clips easier. Upon visiting www.s-cord0.com the user is greeted with the homepage, where a description of the programs functionality lives.
In the header of this homepage are buttons to record/save an audio clip without registering a user (unimplemented.) When registering an account and logging in, the user is 
sent to their unique profile home, where they can record/save an audio clip, this time with playback. (IMPLEMENTED AND WORKING) If the user visits /recordings, then they can get access to
all of their recordings ever made. Ability to add recording titles/descriptions will be implemented in the future, along with modifications/deletions.

Once a user decided to save a recording, a unique identifying token appears, allowing the user to paste this in any chrome browser. The chrome extension allows the user to take a token they
found on the internet and place it into the extension, prompting an API call to /recordings/:token. In response, they get a wav BLOB retrieved from a database. The chrome extension will
then use recorder.js to create a blobURL. Lastly, the extension will modify the dom tree, appending an audio element with the source being that of the blob. This can be immediately played back.
(Semi implemented)

BLOB
=================================================================================

The application is based off of the ability to generate BLOBs. Using a recorder module that measures the samples of a recording, a blob is generated on the front end. Once the user decides
they want to save this, then an ajax call is fired to post the BLOB to the server and into a database. AJAX does not play nicely with BLOBs, so the BLOB was appended to a FormData 
object and then posted to the server, as seen below:

$("#button1").click(function(e) {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: "/speakEZ/DB",
        dataType: 'json',   
        data: currentBlob,
        contentType: false,         // Will only work with false
        processData: false,         
        success: function(result) {
          try {
            var myObj = JSON.stringify(result.blobToken);
          } catch(e) {
            alert(e);
                  }
            recorder && recorder.exportWAV(function(blob) {
            var url = URL.createObjectURL(blob);
      
            var data = new FormData();
            //localStorage.myfile = myBlob;
            data.append('upl', blob);
            currentBlob = data;
         .
         .
         .
         
Once the BLOB reaches the server, a middleware function is used to upload the FormData as a local file using module Multer. The file is then taken from the directory and read in using module
fs, as seen below. Once read in, it is converted to base64 encoding and stored into the recordingsDB collection and the file is removed.

      var newImg = fs.readFileSync(req.file.path);
      var encImg = newImg.toString('base64');
      insertBlob(db,encImg, req.session.username, req.file.filename, req.file.path, function(delFile){
        
        fs.unlinkSync(delFile);
        

BUG: When reading in the file, the encoding does not match the original blob, creating an issue in terms of playback. 


Persistent State
=================================================================================

The application makes use of express' sessions. During each log-in made by a registered user, a new session is generated and put into a collection overwriting the previous session.
Authentication functions are executed when a user makes requests to member restricted pages. During authentication, the current_sessionID is compared to the existing sessionID 
that is stored in the DB for the requesting user. If authentication fails they will get routed accordingly to re-login.

Users login/passwords are validated using the hashed (salted) password and a plaintext password that is submitted by the user upon login. 

**Logins are case sensitive. Inputs are not sanitized.

function updateDoc(user, sessionPass){
    // Connect to DB
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  
  // Authenticate
    db.authenticate('domenico', 'default', function(err, result) {
      assert.equal(true, result);
        db.collection('sessionDB').updateOne({'username': user}, {$set: {current_sessionID: sessionPass}});
          db.close();

        });
      });


How to start running the webserver
=================================================================================

Domain: s-cord0.com (the original name of the application -- domains are expensive)

Route53 controls the domain and NS. Using an AWS EC2 instance, I set the security groups open to all users. Meaning nothing is secure
right now and anyone can SSH in. There is a ssh key required to get access though, which I have included on my github repo.

TO SSH IN: sudo ssh -i sshkeys/scord-mainkey.pem ec2-user@ec2-18-217-88-70.us-east-2.compute.amazonaws.com

REQUIREMENT: Use nvm install 7.7 to run async functions.

Once I set up node and npm using YUM, I was able to generate an express application and test out the functionality. Using sudo PORT=80 node ./bin/www launched the server.

Instead of running app with SUDO:
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
Redirect incoming port 80 traffic to route 3000 using iptables.



MongoDB
=================================================================================

The application uses MongoDB. The mongodb instance is stored on a google cloud platform VM instance. I have created a VM with linux and have installed MongoDB there. In order to authenticate with admin, the user is "domenico" and the password is "default". 

Command line entry:

mongo 35.196.154.162/admin --authenticationDatabase admin -u domenico -p default


Collections 
-------------------------

recordingsDB
---

When a user tries to record a WAV, the generated BLOB gets stored in the collection document, along with their username and a unique token to represent the BLOB. NOTE: Each document holds a maximum of 16MB. 

sessionDB
---

This collection holds documents, where each document has a unique sessionID for a specific user. This collection is used
for authentication purposes. 

userDB
----

The userDB holds information about the registered user as seen below.
All passwords are hashed for security using bcrypt. 

    var insertUser = function(db, req, hash, callback) {
       db.collection('userDB').insertOne( {
          "bio-data" : {
             "fullName" : req.body.firstName + " " + req.body.lastName, 
             "country" : "USA",
             "birthdate" :  req.body.dobYear,
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
=================================================================================



BUGS
=================================================================================
- Functionality is limtied when the application is hosted on s-cord0 domain. A js module is not being recognized from some reason, preventing
any recordings to be generated. This issue does not exist when hosting the website locally. 
