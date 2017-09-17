let total = $('#total');
let form = $('#send');

total.hide();
form.hide();

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
			if (!project.instructions_url) {
				loadChild(project.children);
			} else {
				selectFinal(project);
			}
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

let selectFinal = function(project) {
	$('#projects').empty();
	project.updateMaterials();
	printMaterials(project);
};

let printMaterials = function(project) {
	let total = $('#total');
	let form = $('#send');
	let instructions = $('#instructions_url');
	let projContainer = $('#projects');
	let flexbox = $()

	console.log(project)
	for (let i = 0; i < project.materials.length; i++) {
		console.log(project.materials[i]);
		total.append(project.materials[i].name + " | " + project.materials[i].quantity + '</br>');
	}

	instructions.append("Visit for project details:" + project.instructions_url);
	instructions.attr('href', project.instructions_url);

	projContainer.css('display', 'block');
	form.show();
	total.show();
	total.append(project.total);
};

let getNumber = function() {
	let number = $('.number').value;
	project.sendText(number);
	project.updateMaterials();
	project.total
};

Project.top()
  .then((projects) => {
  	console.log(projects)
    projects.forEach(function(project) {
        renderProject(project)
    });
  });