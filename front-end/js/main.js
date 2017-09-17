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
	setTimeout(function(project) {
		printMaterials(project);
	}, 2000, project);
};

let printMaterials = function(project) {
	let total = $('#total');
	let form = $('#send');
	let instructions = $('#instructions_url');
	let projContainer = $('#projects');
	let flexbox = $()

	for (let i = 0; i < project.materials.length; i++) {
		console.log(project.materials[i]);
		total.append(project.materials[i].name + " | " + project.materials[i].quantity + '</br>');
	}

	instructions.append("Click here for project instructions");
	instructions.attr('href', project.instructions_url);

	projContainer.css('display', 'initial');
	form.show();
	total.show();
	total.append("$" + project.total);

	showModal(project);
};

let showModal = function(object) {
	var modal = document.getElementById('myModal');
	var span = document.getElementsByClassName("close")[0];

	modal.style.display = "block";

    var modalButton = $('.modalButton')

	setTimeout(function() {
		modalButton.click(function(e) {
			e.preventDefault();
			sendNumber(object);
		});
	}, 1000)

	span.onclick = function() {
    	modal.style.display = "none";
    }

    window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}	
};

let sendNumber = function(object) {
	let number = $('.number').val();
	// let number = '7708810074';
	object.sendText(number);
};

Project.top()
  .then((projects) => {
  	console.log(projects)
    projects.forEach(function(project) {
        renderProject(project)
    });
  });
