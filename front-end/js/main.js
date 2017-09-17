let loadProjects = function(projects) {
	console.log(projects);
	if (projects) {
		for (let project in projects) {
			renderProject(project);
		}
	}
}

let renderProject = function(project) {
	$.get('project.mustache', function (template) {
		project.onclickInternalId = Math.random() + "";
		Mustache.parse(template);
		let renderedProject = Mustache.render(template, project);
		$("#projects").append(renderedProject);
		let div = document.getElementById('handler-' + project.onclickInternalId);
		div.addEventListener('click', function() {
			loadChild(project.children);
		});
		console.log(renderProject);
	});
};

let loadChild = function(children) {
	$('#projects').empty();
	Array.from(children).forEach(function(child) {
		renderProject(child);
	});
};

Project.top()
  .then((projects) => {
  	console.log(projects)
    projects.forEach(function(project) {
        renderProject(project)
    });
  });