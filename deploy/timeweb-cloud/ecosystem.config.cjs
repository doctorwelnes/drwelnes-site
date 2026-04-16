const PROJECT_DIR = "/var/www/dr-welnes";
const CURRENT_DIR = `${PROJECT_DIR}/current`;

module.exports = {
  apps: [
    {
      name: "dr-welnes",
      script: `${CURRENT_DIR}/.next/standalone/server.js`,
      cwd: CURRENT_DIR,
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
        DR_WELNES_PROJECT_ROOT: PROJECT_DIR,
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
