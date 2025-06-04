# Przepisowo web app
***

##Runing the project 
***
To properly navigate directories, make sure you are in the root of the project.
***

##Database and Synfony
***
cd App

docker-compose -f docker-compose.yml up -d

composer install

php bin/console doctrine:migrations:migrate

php bin/console lexik:jwt:generate-keypair

symfony server:start -d
***

##Angular
***
cd frontend
npm install
ng serve
***
