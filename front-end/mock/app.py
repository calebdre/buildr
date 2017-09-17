from functools import wraps
from faker import Faker
from random import randint
from flask import Flask, Response, jsonify, make_response

app = Flask(__name__)
fake = Faker()

def add_response_headers(headers={}):
    """This decorator adds the headers passed in to the response"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            resp = make_response(f(*args, **kwargs))
            h = resp.headers
            for header, value in headers.items():
                h[header] = value
            return resp
        return decorated_function
    return decorator

def mock_materials():
    num = randint(2, 6)
    materials = []

    for i in range(num):
        material = {
            'name': fake.sentence(2),
            'price': randint(0, 100),
            'quantity': randint(0, 20),
            'hd_id': fake.ean13()
        }

        materials.append(material)

    return materials

def mock_data(n):
    projects = []

    for i in range(n):
        project = {
            'name': fake.sentence(2),
            'picture_url': fake.image_url(),
            'instructions_url': fake.url(),
            'children': mock_data(n - 1),
            'materials': mock_materials() if n - 1 <= 0 else []
        }

        projects.append(project)

    return projects

@app.route("/mock")
@add_response_headers({'Access-Control-Allow-Origin': '*'})
def mock():
    data = mock_data(3)
    return jsonify(data)
