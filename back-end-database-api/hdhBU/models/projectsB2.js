var db = require('./database');

var project_table = function() {
	db.query('SELECT * FROM project', function(err, results) {
		if (err) throw err;
		projectList = [];
		for (var i = 0; i < results.rows.length; i++) {

			var project = {
				'id': results.rows[i].id,
				'parent_id': results.rows[i].parent_id,
				'name': results.rows[i].name,
				'picture_url': results.rows[i].picture_url,
				'instructions_url': results.rows[i].instructions_url
			}

			projectList.push(project);

		}

		return projectList;
	})
}

var material_table = function() {
	db.query('SELECT * FROM material', function(err, results) {
		if (err) throw err;
		materialList = [];
		for (var i = 0; i < results.rows.length; i++) {

			var material = {
				'id': results.rows[i].id,
				'name': results.rows[i].name,
				'hd_id': results.rows[i].hd_id
			}

			materialList.push(material);

		}

		return materialList;
	});
}

var project_material_xref_table = function() {
	db.query('SELECT * FROM project_material_xref', function(err, results) {
		if (err) throw err;
		outList = [];
		for (var i = 0; i < results.rows.length; i++) {

			var out = {
				'project_id': results.rows[i].project_id,
				'material_id': results.rows[i].material_id,
				'material_quantity': results.rows[i].material_quantity
			}

			outList.push(out);

		}

		return outList;
	});
}

function getAll(callback) {
	console.log(project_table);
	console.log(material_table);
	console.log(project_material_xref_table);
	// db.query('SELECT * FROM project WHERE parent_id IS NULL', function(err, results) {
	// 	if (err) throw err;
	// 	elder_list = [];
	// 	for (var i = 0; i < results.rows.length; i++) {

	// 	}
	// })
}

module.exports = {
	getAll: getAll
}