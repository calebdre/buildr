var db = require('../../models/database');

db.query("SELECT NOW()", function(err, result) {
	if (err) console.log(err);
	console.log(result.rows[0]);
})