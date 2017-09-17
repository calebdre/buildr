var db = require('./database');

function getAll(callback) {
	project_elder(function(elder_list) {
		outList = [];

		var numPushed = 0;
		var numItems = elder_list.length;

		for (var i = 0; i < elder_list.length; i++) {
			(function() {
				var copyOfI = i;
				getObject(elder_list[i], function(outObject) {
					outList.push(outObject);
					numPushed++;
					if (numPushed === numItems) {
						callback(outList);
					}
				})	
			})();
		}
	})
}

function getObject(item, callback) {
	getChildren(item.id, function(child_list) {
		getMaterials(item.id, function(mat_list) {

			var outObject = {
				"name": item.name,
				"picture_url": item.picture_url,
				"instructions_url": item.instructions_url,
				"children": child_list,
				"materials": mat_list
			}

			callback(outObject);

		})
	})
}

function getMaterials(project_id, callback) {
	db.query('SELECT * FROM project_material_xref WHERE project_id = ' + project_id, function(err, results) {
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
		callback(materialList);
	})
}

function getChildren(parent_id, callback) {
	db.query('SELECT * FROM project WHERE parent_id = ' + parent_id, function(err, results) {
		if (err) throw err;
		projectList = [];

		for (var i = 0; i < results.rows.length; i++) {

			// var project = {
			// 	'id': results.rows[i].id,
			// 	'parent_id': results.rows[i].parent_id,
			// 	'name': results.rows[i].name,
			// 	'picture_url': results.rows[i].picture_url,
			// 	'instructions_url': results.rows[i].instructions_url
			// }

			// projectList.push(project);

			getObject(results.rows[i], function(item) {
				projectList.push(item);
			})

		}
		callback(projectList);
	})
}

function project(callback) {
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
		callback(projectList);
	});
}

function project_elder(callback) {
	db.query('SELECT * FROM project WHERE parent_id IS NULL', function(err, results) {
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
		callback(projectList);
	});
}

function material(callback) {
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
		callback(materialList);
	});
}

function project_material_xref(callback) {
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
		callback(outList);
	});
}

module.exports = {
	getAll: getAll,
	getChildren: getChildren,
	getMaterials: getMaterials,
	project: project,
	project_elder: project_elder,
	material: material,
	project_material_xref: project_material_xref
}