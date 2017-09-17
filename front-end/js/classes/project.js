class Project {
  constructor(name, picture_url, instructions_url, children, materials) {
    this.name = name;
    this.picture_url = picture_url;
    this.instructions_url = instructions_url;
    this.children = children.map((child) => Project(child.name, child.children, child.materials, picture_url, instructions_url));
    this.materials = materials.map((material) => Material(material.name, material.price, material.quantity, material.hd_id));
  }

  static all() {
    // to do
  }
}
