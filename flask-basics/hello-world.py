from flask import Flask, make_response, render_template
import os
import markdown.extensions.fenced_code

app = Flask(__name__)

"""
Module: Return Markdown
"""

@app.route("/wow")
def mark_my_words():
    readme_file= open(os.path.join("README.md"), "r")
    md_template_string = markdown.markdown(readme_file.read(), extensions=["fenced_code"])
    return md_template_string


@app.route("/hello")
def hello_world():
    print("Received a request on /hello!")
    return "Hello World !"


"""
Module: Adding different routes
"""


@app.route("/goodbye")
def goodbye():
    print("Received a request on /goodbye")
    return "Good Bye"

"""
Module returning data
"""
@app.route("/mdr")
def made_up_response():
    user = {"id": "102522", "name": "Hashit"}
    response = make_response(
        user,
        200,
    )
    response.headers['Content-Type'] = "application/json"
    return response


"""
Module: responding with templates
"""    

@app.route("/article-1")
def article1():
    return render_template(
        'article.html',
        title="My first flask app",
        content="Thank you for visiting my blog"
    )


"""
Module: Implement Catch All Route
"""    


@app.route('/', defaults={"path": ""})
@app.route('/<path:path>')
def handle_request(path):
    if path == 'hello':
        return hello_world
    elif path == 'wow':
        return mark_my_words
    elif path == 'mdr':
        return made_up_response
    elif path == 'goodbye':
        return goodbye
    else:
        print(f'developer is looking for {path}, ended in catch all route')
        return 'Welcome to Forest Unknown, Check your routes for any typos'