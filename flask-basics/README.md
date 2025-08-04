## Run 
`python3
flask --app hello-world run
`

## Run with Debug Mode On
`python3
 flask --app hello-world --debug run
`


## Returning Data
_The `/mdr` uses make_response library to return response with customized `headers` and `status_code`_


## Render Data with Templates
_The `render_template` function in flask takes in filename, title and content where title and contents are user defined fields but filename with extension is required component of the signature_
