const PROJECT_DIR = "/var/www/dr-welnes";

module.exports = {
  apps: [
    {
      name: "dr-welnes",
      script: `${PROJECT_DIR}/.next/standalone/server.js`,
      cwd: PROJECT_DIR,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
