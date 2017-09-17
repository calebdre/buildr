var db = require('./database');


function runAsyncActions(functions, callback) {
	var results = [];
	for (var i = 0; i < functions.length; i++) {
		functions[i](function(result) {
			results.push(result);
			if (results.length === functions.length) {
				callback(results);
			}
		});
	}
}

function getAll(callback) {
	getProjectElders(function(elder_list) {

		runAsyncActions(elder_list.map(function(item) {
			return function(callback) {
				getProjectWithChildren(item, callback);
			}
		}), callback);
	});
}


function getProjectWithChildren(item, callback) {

	db.query('SELECT * FROM project WHERE parent_id = ' + item.id, function(err, results) {
		if (err) throw err;


		var projectList = results.rows;

		db.query('SELECT * FROM project_material_xref WHERE project_id = ' + item.id, function(err, results) {
			if (err) throw err;

			var materialList = results.rows;

			var outObject = {
				"name": item.name,
				"picture_url": item.picture_url,
				"instructions_url": item.instructions_url,
				"materials": materialList,
				"children": []
			};

			if (projectList.length > 0) {
				runAsyncActions(projectList.map(function(project) {
					return function(callback) {
						getProjectWithChildren(project, callback);
					};
				}), function(children) {
					outObject.children = children;
					callback(outObject);
				});
			} else {
				callback(outObject)
			}
		})
	})

}

function getProjectElders(callback) {
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

module.exports = {
	getAll: getAll,
}