# manage.py

contains commands to run on the django project

# Wisdompets/WSGI.py 

provides hook for apache and nginx when django app is running on
live server

# Wisdompets/Settings.py 

configures django

# Wisdompets/urls.py

routes requests based on urls patterns

# Note
We usually don't edit wisdompets/{__init__.py,wsgi.py,asgi.py} 

# Create Django project
django-admin startproject <project-name>

# Create application within django project
cd project-name/

python3 manage.py startapp <app-1>

# Pieces of an app within Django project
| File  | Use |
| --- | --- |
| app.py | controls settings specific to the individual app within the django project     | 
| models.py | used to construct database schema   |
| admins.py | defines administrative interface for the individual app |
| urls.py | used for defining routes specific to the individual app|
| views.py | controls the view and http responses for sent out by the app |
| test.py | can be used for writing unit tests |
| migrations/ | holds different version of schema as we make changes to the database |


# Django MVC
request routing
urls.py defines route patterns to act on 

view.py defines control flow or logic 
to process the request
    - views.py also leverages templates

models.py defines queries against db
    - models create the data layer
    - define the database structure
    - model is a class that inherits
    from django.db.models.Model and
    defines database fields as class
    attributes
    
# Project Requirements
- store name/age/vaccine etc
- allow admins to perform CRUD on pet records
- allow users to see a list of available pets details


# Why use Migrations 
- adding a database
- adding a field
- removing a field 
- changing a field

python manage.py makemigrations
    - generates migration scripts
python manage.py showmigrations
python manage.py migrate

python3 manage.py createsuperuser
