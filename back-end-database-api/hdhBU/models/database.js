// Sets up database if it is not initialized, then gives other models a connection to use

var pg = require('pg');

var config = {
	user: 'postgres',
	host: 'db.ferrerluis.com',
	database: 'home_depot',
	max: 25,
	idleTimeoutMillis: 30000
}

var pool = new pg.Pool(config);

function query(text, cb) {
	pool.connect(function (err, client, done) {
		if (err) console.log(err);
		client.query(text, function (err, result) {
			done();
			if (cb) cb(err, result);
		})
	})
}

function transaction(text, cb) {
	pool.connect(function (err, client, done) {
		if (err) console.log(err);
		client.query("BEGIN");
		for (var i = 0; i < text.length; i++) {
			client.query(text[i], function (err, result) {
				if (err) {
					console.log(err);
					client.query("ROLLBACK");
					done();
					return;
				}
			})
		}
		client.query("COMMIT");
		done();
		if (cb) cb(err);
	})
}

module.exports = {
	query: query,
	transaction: transaction
}

///// DATABASE SETUP /////
// connection.query('CREATE DATABASE IF NOT EXISTS traintracks', function(err) {
// 	if (err) throw err;
// 	connection.query('USE traintracks', function(err) {
// 		if (err) throw err;
// 		// Level Table
// 		connection.query('CREATE TABLE IF NOT EXISTS level('
// 			+ 'level_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
// 			+ 'level_name VARCHAR(30) NOT NULL'
// 			+ ')', function(err) {
// 				if (err) throw err;
// 			});
// 		// Techniques Table
// 		connection.query('CREATE TABLE IF NOT EXISTS techniques('
// 			+ 'technique_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
// 			+ 'name VARCHAR(30) NOT NULL,'
// 			+ 'type ENUM("B", "F", "S", "O") NOT NULL,'
// 			+ 'req_level INT UNSIGNED NOT NULL,'
// 			+ 'FOREIGN KEY (req_level) REFERENCES level(level_id)'
// 			+ ')', function(err) {
// 				if (err) throw err;
// 			});
// 		// Student table
// 		connection.query('CREATE TABLE IF NOT EXISTS students('
// 			+ 'student_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,'
// 			+ 'first_name VARCHAR(30) NOT NULL,'
// 			+ 'last_name VARCHAR(30) NOT NULL,'
// 			+ 'birth_date DATE NOT NULL,'
// 			+ 'student_level INT UNSIGNED NOT NULL,'
// 			+ 'sex ENUM("M", "F") NOT NULL,'
// 			+ 'FOREIGN KEY (student_level) REFERENCES level(level_id)'
// 			+ ')', function(err) {
// 				if (err) throw err;
// 			});
// 		// Rating table
// 		connection.query('CREATE TABLE IF NOT EXISTS rating('
// 			+ 'technique_id INT UNSIGNED NOT NULL,'
// 			+ 'student_id INT UNSIGNED NOT NULL,'
// 			+ 'score INT NOT NULL,'
// 			+ 'FOREIGN KEY (technique_id) REFERENCES techniques(technique_id),'
// 			+ 'FOREIGN KEY (student_id) REFERENCES students(student_id),'
// 			+ 'PRIMARY KEY(technique_id, student_id)'
// 			+ ')', function(err) {
// 				if (err) throw err;
// 			});
// 	});
// });