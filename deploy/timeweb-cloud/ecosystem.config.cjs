module.exports = {
  apps: [
    {
      name: "dr-welnes",
      script: ".next/standalone/server.js",
      cwd: ".",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
