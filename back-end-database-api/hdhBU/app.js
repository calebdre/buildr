// Dependencies
var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser');

// Init and Configure App and MySql
var app = module.exports = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(require('./controllers'));

app.locals.moment = require('moment');

// Begin Listen
var listenPort = process.env.PORT || 2428;
var server = app.listen(listenPort, '0.0.0.0', function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Running at http://' + host + ':' + port)
})