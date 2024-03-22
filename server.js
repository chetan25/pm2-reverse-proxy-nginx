const express = require("express");

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
  res.send("hello world");
});

app.get("/delay", (req, res) => {
  delay(2000);
  res.send("Delayed");
});

app.listen(3000, () => {
  console.log("Listening at 3000 ");
});
