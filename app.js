var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var index = require('./routes/index');
var speakEZ = require('./routes/speakEZ');
var registration = require('./routes/registration');
var login = require('./routes/login');
var recordings = require('./routes/recordings');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var ObjectId = require('mongodb').ObjectID;
const mongodb = require('mongodb');


var url = 'mongodb://domenico:default@REDACTED:27017/admin'
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(session({
  store: new RedisStore({port:6379, host: '18.216.6.163'}),
  secret: "2C44-4D44-WppQ38S",
  resave: false,
  saveUninitialized: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/speakEZ', speakEZ);
app.use('/registration', registration);
app.use('/login', login);
app.use('/recordings', recordings);

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  
  console.log("Trying to authenticate user now");
  console.log("authenticating: " + req.session.username );
  
  if (AuthenticateUser(req.session.loginID, req.session.username)){
    console.log("Authentication Success!");
    return next();
  }
  else{
    console.log("Authentication failed!");
    return res.sendStatus(401);}
};


// Authentication helper
async function AuthenticateUser(sessionCookie, sessionUser) {
  const db = await mongodb.MongoClient.connect(url);

  // Don't `await`, instead get a cursor
  const cursor = db.collection('sessionDB').find({'username': sessionUser});
  // Use `next()` and `await` to exhaust the cursor
  for (let doc = await cursor.next(); doc != undefined; doc = await cursor.next()) {
    console.log("doc:" + doc);
        
  db.close();
  
  if(doc.current_sessionID == sessionCookie){
    console.log("We are in the right session");
   return true;}
 else{
    console.log("Could not authenticate session");
    return false;
  }
}
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Forbidden input');
  err.status = 403;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
