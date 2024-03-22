# Node PM2 + Nginx + Docker

Simple NodeJs server managed by PM2 for performance optimizations and reversed proxy via nginx. The setup is run in Docker containers

## Node PM2

- We have configured PM2 to be used in cluster mode with max capacity, so that it automatically creates the clusters matching the CPU cores.
- Created a Dockerfile to spin up a container with Node image and pm2 and express as deps, that runs PM2 to start the server.

## NGINX

- We are using the `template` setup of NGINX bcs it works well with environment variables and let us substitute the values when the docker image for NGINX runs.
- We have created a `default.conf.template` file that holds the `server` directive that will be overriding the default one.
- The env variables will be pluck in my the docker nginx image before starting the nginx server.

### Commands

- To Run

  > docker compose up

- To check the logs of a container
  > docker exec -it nginx-server sh
  > here `nginx-server` is the name of the container we have specified in the docker compose file
