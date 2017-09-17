var express = require('express');
var router = express.Router();
var projects = require('../models/projects');

router.get('/', function(req, res) {
	// Get all
	projects.getAll(function(list) {
        res.set('Access-Control-Allow-Origin', '*');
		res.json(list);
	})

});

module.exports = router;
