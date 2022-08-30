# ENDPOINTS

[GET]

- /users -> Provides a list with all users
- /projects -> Provides a list with all projects

- /projects/:id -> Provides a specific project by id
- /projects/:user-name -> Provides a list of users filtered by user

[POST]

- /users/log-in -> Verifies user password and username. Responds with a token
- /users/sign-up -> Adds the new user to the database. Responds with the new user

- /projects/create -> Posts a new project. Responds with the new project

[DELETE]

- /projects/delete/:id -> Deletes the project with specified id

- /users/delete/:id -> Deletes the user with specified id

[PUT]

- /projects/update -> Updates project. Responds with updated project

[PATCH]

- /users/:req-id/:id -> Finds the user specified in the firs id and adds as a friend the user specified in the second one
