var express    = require('express');
var path       = require('path');
var bodyParser = require('body-parser'); // for handling POST data
var favicon    = require('serve-favicon');

var publicDir = require('./helpers/path_helpers').publicDir;

// Dev dependencies
var mock   = require('./db/mock_db');
var logger = require('morgan'); // Logging middleware

// Clear the DB on reset for testing.
mock.mockDB();

var app  = express();
var port = process.env.PORT || 8000;


// Middlewares
app.use(logger('dev')); // Morgan
app.use(favicon(path.join(publicDir, 'favicon.ico')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(publicDir)); // Serve files from /public on /

// Routes
// app.use('/', require('./routes/index').indexRouter);
app.use('/api', require('./routes/api').apiRouter);

app.listen(port);
console.log('Server running on', port);
