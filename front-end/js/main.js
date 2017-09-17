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
		Mustache.parse(template);
		let renderedProject = Mustache.render(template, project);
		console.log(renderedProject);

		$("#projects").append(renderedProject);
	});
};

Project.top()
    .then((projects) => {
        projects.forEach(function(project) {
            renderProject(project)
        });
    });