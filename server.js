var express = require('express');
var path    = require('path');
var logger  = require('morgan'); // Logging middleware
var favicon = require('serve-favicon');

var app     = express();
var port    = process.env.PORT || 8000;

var publicDir = path.join(__dirname, 'client');
module.exports.publicDir = publicDir;

// Middlewares
app.use(logger()); // Morgan
app.use(favicon(path.join(publicDir, 'favicon.ico')));
app.use(express.static(publicDir));

// Routes
// app.use('/', require('./routes/index').indexRouter);
app.use('/api', require('./routes/api').apiRouter);

app.listen(port);
console.log('Server running on', port);

