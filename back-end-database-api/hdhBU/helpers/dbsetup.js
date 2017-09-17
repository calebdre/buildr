var connection = require('../models/database');

connection.transaction([
	// Tools
	"CREATE TABLE IF NOT EXISTS material("
	+ "id SERIAL PRIMARY KEY,"
	+ "name TEXT NOT NULL,"
	+ "hd_id TEXT"
	+ ")",

	// Project
	"CREATE TABLE IF NOT EXISTS project("
	+ "id SERIAL PRIMARY KEY,"
	+ "parent_id INT REFERENCES project(id),"
	+ "name TEXT NOT NULL,"
	+ "picture_url TEXT,"
	+ "instructions_url TEXT"
	+ ")",

	"CREATE TABLE IF NOT EXISTS project_material_xref("
	+ "project_id INT REFERENCES project(id),"
	+ "material_id INT REFERENCES material(id),"
	+ "material_quantity INT DEFAULT 1"
	+ ")"

	], function(err) {
		if (err) throw err;
	})