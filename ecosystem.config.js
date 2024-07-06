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
      exec_mode: "cluster",
      instances: "max",
      log_type: "json",
      log_file: "./logs/log.json",
      out_file: "./logs/out.json",
      error_file: "./logs/error.json",
      env: {
        PORT: 3001,
        SERVER_NO: "Server 2",
      },
    },
  ],
};
