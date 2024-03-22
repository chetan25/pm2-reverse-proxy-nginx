const express = require("express");
/**
 * Clusters of Node.js processes can
 * be used to run multiple instances of
 * Node.js that can distribute
 * workloads among their application
 * threads. When process isolation is
 * not needed, use the worker_threads
 * module instead, which allows running
 *  multiple application threads within a single Node.js instance.
 * The cluster module allows easy creation of
 * child processes that all share server ports.
 * The master orchestrates the worker proceess and
 * the worker process accepts the http request and responds to them.
 * Each worker process has all the code.
 * All code is executed for all process
 */
const cluster = require("cluster");
const os = require("os");

const app = express();

const delay = (duration) => {
  const start = Date.now();
  // this will be processed by EVENT LOOP, since its not a IO operation
  //  so it won't be passed on to thread pool or Operating system as its not an IO operation
  // this will block the main thread (event loop)
  while (Date.now() - start < duration) {
    // do nothing
  }
};

app.get("/", (req, res) => {
  res.send(`hello world from: ${process.pid}`);
});

app.get("/delay", (req, res) => {
  delay(2000);
  res.send(`Delayed from ${process.pid``}`);
});

if (cluster.isMaster) {
  console.log(`Master is running ${process.pid}`);
  const cpus = os.cpus();
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  app.listen(3000, () => {
    console.log(`Worker is running at 3000 for ${process.pid}`);
  });
}
