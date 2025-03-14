<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


# Teslo API

1. Clonar el proyecto
2. Instalar los decoradores para typeORM
`````
npm add @nestjs/typeorm typeorm
`````
3. Instalar el driver para comunicarnos con postgres
`````
npm install pg --save
`````
4. Clonar el archivo ````.env_template```` y renombrarlo a  ````.env````
5. Levantar la base de datos en modo observador (opción 1)
`````
docker-componse up 
`````
5. Levantar la base de datos en segundo plano (opción 2)
`````
docker-componse up -d
`````
6. Levantar: ````npm run start:dev````

7. Ejecutar seed

`````
http://localhost:3000/api/seed
`````
