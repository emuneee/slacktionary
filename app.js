var express = require('express');
var http = require('http');
var compression = require('compression');
var responseTime = require('response-time');
var bodyParser = require('body-parser');
var parseString = require('xml2js').parseString;
var request = require('request');

// load the config
var config = require('./config.js');

// configure express
var app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(responseTime());
app.disable('x-powered-by');


// routes
app.get('/', function(req, res) {
	res.send(':-)');
});

app.post('/define', function(req, res) {
	var text = req.body.text;
	var user = req.body.user_name;
	var trigger_word = req.body.trigger_word;

	console.log('Defining the word ' + text + ' for user ' + user);

	// send request to dictionary api
	var url = 'http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/' + text + '?key=' + config.dictionary_api_key;

	request(url, function (error, response, body) {

		if (!error && response.statusCode == 200) {
			// turn xml into jsx
			parseString(body, function (err, js) {
			    console.dir(JSON.stringify(js));

			    var slackRes = {
			    	text : js.entry_list.entry[0].sens[0].mc[0]
			    };
			    res.send(slackRes);
			});
		} else {
			console.log('Error: ' + error + ', status code: ' + response.statusCode);
			res.send(error);
		}
	});
});

// crank dat server
http.createServer(app).listen(config.server_port, function() {
    console.log('Slacktionary is alive on port ' + config.server_port);
});