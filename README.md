---
Title: Node PM2 + Nginx + Docker.
Excerpt: Simple Node server managed by PM2 and reversed proxied and load balanced via NGINX, running on Docker containers.
Tech: "Node JS, PM2, NGINX, Docker, Javascript"
---

# Node PM2 + Nginx + Docker

Simple NodeJs server managed by PM2 for performance optimizations and reversed proxy via nginx. The setup is run in Docker containers. Docker makes it easy to pass `env` variables to nginx

## Node JS Basics

- Node Js is single threaded and even if we run it on a server with
  multiple cores, it will still use a single thread(process).
- Node has a `cluster` module that allows us to take advantage of multi core systems.
- It helps to create child process which share same server port but runs on different processes on the CPU core.
- Processes are basically scoped containers running our code.
- Node comprises of the following:

  1. V8 Engine - JS engine that runs our code.
  2. Node Js APIS - These are function written in Javascript, that we dlegate work too. These are basically wrapeer around core functions written in C/C++ like fs, http, path, crypto etc.
  3. Node JS bindings - These are bridges between the JS code and C and C++ code in Libuv.
  4. Libuv - Its a library that has the core functions written in C/C++ which deals with i/p and o/p tasks. It has all functionality which the NodeJS APIs calls. It abstracts away all logic related to OS. It also has pool of thread for multi threading work, like reading data or file system operations. There are 4 threads by default. For Network it uses OS kernel and not the thread pool. We can change the thread pool size by setting the env variable

  ```js
  // update the default thread pool from 4 to 2
  process.env.UV_THREADPOOL_SIZE = 2;
  ```

- This is the basic flow how the code we write flows in the Node land:

  ```js
  JS code ---> JS Engine(V8) ---> NodeJS APIs ---> Node bindings ---> Libuv
  ```

- Basic non blocking operatiosn are:
  1. Reading from Ram or L1, L2 or L# cache
- Basic blocking operations are:
  1. Reading from Disk or file or DB
  2. Making network call

## PM2

We can use the Node cluster module to spin up child process and make our code use the multi core cpu, but the management of these child process can get cumbersome, that's why in production its prefered to use PM2. The definition of [PM2](https://pm2.keymetrics.io/) from its website

```js
PM2 is a daemon process manager that will help you manage and keep your application online 24/7
```

### PM2 setup

We can configure PM2 either using `cli arguments` or the `config` file, and in this repo we have used the config file `ecosystem.config` to configure our PM2. Here is our basic configuration:

- We have configured PM2 to be used in cluster mode with max capacity, so that it automatically creates the clusters matching the CPU cores.
- We let PM@ decide on how many clusters to create based on the logical core.Logical core is different than physical one. ex if your machine has 4 physical core and each can process 2 threads at a time than logical core is `4 \* 2 = 8`.
- To mimic multiple servers, we have configured PM2 to spin up our backend in 2 servers, that are running on different ports. These servers are used by nginx for load balancing.
- We have also configured PM2 to generate our logs/errors/outputs in a specified folder.
- Pm2 will manage these clusters and if anyone crashes it will auto start it.
- We have containerized our backend and using Docker to spin up a container with Node image and pm2 and express as deps, that runs PM2 to start the server.

```js
module.exports = {
  apps: [
    {
      name: "node-be",
      script: "./server-pm2.js",
      exec_mode: "cluster",
      instances: "max",
      log_type: "json",
      log_file: "./logs/log.json",
      out_file: "./logs/out.json",
      error_file: "./logs/error.json",
      env: {
        PORT: 3000,
        SERVER_NO: "Server 1",
      },
    },
    {
      name: "node-be-2",
      script: "./server-pm2.js",
      ....
      env: {
        PORT: 3001,
        SERVER_NO: "Server 2",
      },
    },
  ],
};
```

- To run ot from a command line using `cli` here is an example:
  ```js
   pm2 start server.js -i 0
  ```
- To inspect running instances in PM2 we can
  1. pm2 list -- summaries what going on in cluster
  2. pm2 show <applicationName> - ap per start command - pm2 show server - to see details about it
  3. pm2 monit -- shows details info of every cluster process in a nice dashboard.

## NGINX

Nginx is a web server that can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache. We have used it for reverse proxy and load balancing.

- Nginx has one master process and several worker processes.
- We are using the `template` setup of NGINX bcs it works well with environment variables and let us substitute the values when the docker image for NGINX runs.
- We have created a `default.conf.template` file that holds the `server` directive that will be overriding the default one.
- The env variables will be pluck in my the docker nginx image before starting the nginx server.

```js
// default.conf.template file
server {
  listen ${NGINX_PORT};
  server_name ${NGINX_HOST};

  location / {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";

    proxy_pass http://${SERVER_HOST}:${SERVER_PORT}/;

    proxy_http_version 1.1;
  }
}

```

- For `upstream` to work with nginx and docker locally we have to switch from using
  `localhost` in upstream to the local ip instead `172.18.0.1`

```js
// instead of
upstream nodeapi {
  server localhost:${SERVER_PORT};
  server localhost:${SERVER_PORT2};
}
// to using local ip
upstream nodeapi {
  server 172.18.0.1:${SERVER_PORT};
  server 172.18.0.1:${SERVER_PORT2};
}
```

## Local Development

For local development make sure the following things are setup:

1.  You have Desktop version of Docker installed and running.
2.  Run `npm install` for installing the dependencies.
3.  There is a default `.env` file provided feel free to update the values. But make sure the PORT values match the PM2 config.
4.  Then run either of the commands below for starting a docker container

```js
docker composr up --build ---> to re build the image
docker compose up --> if image exists
docker exec -it nginx-server sh ---> to checks thr logs in docker container. Here `nginx-server` is the name of the container.
```
