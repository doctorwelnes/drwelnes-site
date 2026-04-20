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
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      },
    },
  ],
};
