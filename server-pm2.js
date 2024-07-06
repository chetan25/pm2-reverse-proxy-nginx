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
  res.send(`hello world from ${process.env.SERVER_NO}`);
});

app.get("/delay", (req, res) => {
  delay(2000);
  res.send("Delayed");
});

app.listen(process.env.PORT, () => {
  console.log(`Listening at ${process.env.PORT}`);
});
