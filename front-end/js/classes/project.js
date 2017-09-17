class Project {
  constructor(name, picture_url, instructions_url, children, materials) {
    this.name = name;
    this.picture_url = picture_url;
    this.instructions_url = instructions_url;
    this.children = children.map((child) => new Project(child.name, child.picture_url, child.instructions_url, child.children, child.materials));
    this.materials = materials.map((material) => new Material(material.name, material.price, material.quantity, material.hd_id));
  }

  static get constants() {
    return {
      API_URL: 'http://127.0.0.1:5000/mock'
    }
  }

  static top() {
    // Returns a Promise object. Use that promise as `promise.then((projects) => { ... })`
    return Promise.resolve($.get(Project.constants.API_URL))
      .map((project) => {
        return new Project(project.name, project.picture_url, project.instructions_url, project.children, project.materials);
      });
  }
}
