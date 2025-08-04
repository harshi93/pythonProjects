# Personal Portfolio
 
### Built using 
    - Django
    - PostgreSQL 10
    - Jinja
    - Bootstrap
    - Django Widget Tweaks
    - Crispy Forms

### Implements
    - A Home Page
    - Email Module
    - Rest API
    - DB Models
    - Image Upload Module For Admin Users
    - Create/View/Update/Delete Application
    - Endpoints
        - /
        - /jobs/<int:id>
        - /conversation
        - /discuss
        - /lue
        - /list 
        - /<int:id>
        - /demp/<int:id>

### Important Commands

- Install packages
    ```
    pip install -r requirements.txt
    ```

- Install DB Models
    ```
    python3 manage.py makemigration

    python3 manage.py collectstatic

    python3 manage.py migrate

    ```

- Start server
    ```
    python3 manage.py runserver
    ```


# Upcoming 
- Login