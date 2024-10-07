How to run this project 
Prereq-
  Docker
  Npm
  Golang
Run-
docker-compose up --build

After this command 3 container will start running
1- Postgres
2- Bancked (golang)
3- Frontend (react)

We can run the each app individually 
Backed-
  go run .
Frontend-
  npm start

There is issue one might face in code in jwt-decode library.
I am using "import { jwtDecode } from "jwt-decode";"
which may not be wokr for you.
you try different one like "import { jwt-decode } from "jwt-decode";" (Not tested)
