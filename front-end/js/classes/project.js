class Project {
    constructor(name, picture_url, instructions_url, children, materials) {
        this.name = name;
        this.picture_url = picture_url;
        this.instructions_url = instructions_url;
        this.children = children.map((child) => new Project(child.name, child.picture_url, child.instructions_url, child.children, child.materials));
        this.materials = materials.map((material) => new Material(material.name, material.quantity));
    }

    static get constants() {
        return {
          DB_API_URL: 'http://1c987044.ngrok.io',
          CHECK_API_URL: 'http://buildr.ferrerluis.com:5000/check_best_products',
          TEXT_API_URL: 'http://buildr.ferrerluis.com:5000/send_text_message'
        }
    }

    static top() {
        // Returns a Promise object. Use that promise as `promise.then((projects) => { ... })`
        return Promise.resolve($.get(Project.constants.DB_API_URL))
          .map((project) => {
            return new Project(project.name, project.picture_url, project.instructions_url, project.children, project.materials);
          });
        }

    updateMaterials() {
        var elements = this.materials.map((material) => material.name).join().replace(/\s/g, '%20');
        var query = '?q=' + elements;
        return Promise.resolve($.get(Project.constants.CHECK_API_URL + query))
          .then((data) => {
            this.total = data.totalPrice;
            data.items.forEach((item, index) => {
                if (item.found) {
                    this.materials[index].price = item.priceFloat;
                    this.materials[index].product_id = item.productId;
                } else {
                    this.materials[index].price = null;
                    this.materials[index].product_id = 'xyz';
                }
            });
          });
    }

    sendText(phone) {
        var elements = this.materials.map((material) => material.product_id).join();
        var query = '?lat=33.7753208&lng=-84.3909989&phone=' + phone + '&productIds=' + elements;
        Promise.resolve($.get(Project.constants.TEXT_API_URL + query));
    }
}
