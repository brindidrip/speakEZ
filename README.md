# speakEZ

[[Quick Video Demo]](https://www.youtube.com/watch?v=LLqZFrmpqeM)

[![80185938f1da02bfb4c10f3b957cb784.png](https://i.postimg.cc/QtWbgFN0/80185938f1da02bfb4c10f3b957cb784.png)](https://postimg.cc/tZpWpCxx)

## Introduction

This application exists to make sharing audio clips easier. Users can quickly generate a recording along with a shareable link. The user has the ability to record/save recordings without registration. Once a recording is made, they are given access to a speakEZ token that allows for the recording to be shared through a Google Chrome extension, along with an option to download the recording, or a separate link to the individual recording. The chrome extension allows a user to place any speakEZ token into the extension, prompting an API call which will automatically retrieve the recording and play it in the user's browser. 

### BLOB

The application is based off of the ability to generate BLOBs. Using a recorder module that measures the samples of a recording, a blob is generated on the front end. Once the user decides they want to save this, then an ajax call is fired to post the BLOB to the server and into the database. AJAX does not play nicely with BLOBs, so the BLOB was appended to a FormData object and then posted to the server, as seen below:

    $("#saveButton").click(function(e) {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: "/speakEZ/DB",
        dataType: 'json',   
        data: currentBlob,
        contentType: false,
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
            data.append('upl', blob);
            currentBlob = data;
         .
         .
         .
         
Once the BLOB reaches the server, a middleware function is used to upload the FormData as a local file using the module Multer. The file is then uploaded and stored into the recordingsDB mongoDB collection and the file is removed locally.
  
 ### Persistent State
 
The application makes use of express' sessions. During each log-in made by a registered user, a new session is generated and put into a collection overwriting the previous session. Authentication functions are executed when a user makes requests to member restricted pages. During authentication, the current_sessionID is compared to the existing sessionID that is stored in the DB for the requesting user. If authentication fails they will get routed accordingly to re-login.

Users login/passwords are validated using the hashed (salted) password and a plaintext password that is submitted by the user upon login. 

### Web Server

Domain:
    
    s-cord0.com

Route53 controls the domain and NS.

TO SSH IN:

    sudo ssh -i sshkeys/scord-mainkey.pem ec2-user@[ip].us-east-2.compute.amazonaws.com

REQUIREMENT:

    Use nvm install 7.4 to run async functions.

Instead of running app with SUDO:

    // Redirect incoming port 80 traffic to port 3000 using iptables.
    sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-ports 300

## MongoDB

This application uses MongoDB. The mongodb instance is stored on a google cloud platform VM instance. I have created a VM with linux and have installed MongoDB there. In order to authenticate with admin, the user is "domenico" and the password is "default". 

    mongo [ip]/admin --authenticationDatabase admin -u domenico -p default

### Collections

#### recordingsDB

When a user tries to record a WAV, the generated BLOB gets stored in the collection document, along with their username and a unique token to represent the BLOB.

#### sessionDB

This collection holds documents, where each document has a unique sessionID for a specific user. This collection is used
for authentication purposes. 

#### userDB

The userDB holds information about the registered user as seen below.
All passwords are hashed for security using bcrypt. 

## bcrypt     

The purpose of the salt is to defeat rainbow table attacks and to resist brute-force attacks in the event that
someone has gained access to your database. bcrypt in particular uses a key setup phase that is derived from Blowfish.

https://codahale.com/how-to-safely-store-a-password/

How does node.bcrypt.js compare hashed and plaintext passwords without the salt?
https://stackoverflow.com/questions/13023361/how-does-node-bcrypt-js-compare-hashed-and-plaintext-passwords-without-the-salt

## redis

Installing redis on EC2 
https://gist.github.com/FUT/7db4608e4b8ee8423f31

    ssh -i sshkeys/redisAWS.pem ec2-user@[ip].us-east-2.compute.amazonaws.com

## TODO

[ ] - Implement user input sanitization/validation
