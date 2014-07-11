var express = require('express');
var path    = require('path');
var logger  = require('morgan'); // Logging middleware

var app     = express();
var port    = process.env.PORT || 8000;

// Middlewares
app.use(logger()); // Morgan
app.use(express.static(path.join(__dirname, 'public')));

// Routes
// app.use('/', require('./routes/index').indexRouter);
app.use('/api', require('./routes/api').apiRouter);

app.listen(port);
console.log('Server running on', port);
