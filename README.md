First clone the repo.

Next run npm install to install all dependencies.

Env file is included with free mongodb atlas account but can also be changed to your own username and password if you want to test on local machine.
You can test all endpoints using Postman:
1. POST endpoint: /org/create with body:
● organization_name
● email
● password
to create a new organization which auto saves the admin
2. GET endpoint: /org/get?organization_name=<name> to fetch details of that organization
3.PUT endpoint: /org/update with body:
● organization_name
● email
● password
to update details
4. POST endpoint: /admin/login with body:
● email
● password
to login using admin email and password
5. DELETE endpoint: /org/delete with body:
● organization_name
for deleting that specific organaization
