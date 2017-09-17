from functools import wraps
from flask import Flask, Response, jsonify, make_response

app = Flask(__name__)

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

@app.route("/mock")
@add_response_headers({'Access-Control-Allow-Origin': '*'})
def mock():
    data = {
        'name': 'Test',
        'picture_url': 'http://www.top13.net/wp-content/uploads/2015/10/perfectly-timed-funny-cat-pictures-5.jpg',
        'instructions_url': 'http://www.instructables.com/id/Coffee-table-for-free/',
        'children': [],
        'materials': []
    }
    return jsonify(data)
