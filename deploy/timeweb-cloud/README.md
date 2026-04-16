# Timeweb Cloud deployment guide

This folder contains everything you need to deploy **Dr.Welnes** on a Linux VPS at Timeweb Cloud with **Nginx + PM2 + standalone Next.js**.

## What is included

- `deploy-atomic.sh` — one-command deploy/update script
- `ecosystem.config.cjs` — PM2 process configuration
- `nginx.conf` — reverse proxy config for Nginx
- `env.production.example` — production environment template for a VPS

> `deploy.sh` at the repository root now just calls `deploy-atomic.sh`.

The deploy script now uses an **atomic release flow**:

- each build goes into `releases/<timestamp>-<gitsha>`
- the live app always runs from the `current` symlink
- `public/uploads` stays persistent in `shared/public/uploads`
- if the healthcheck fails, the script rolls back to the previous release

## Recommended server

- **CPU:** 2 vCPU
- **RAM:** 4 GB
- **Disk:** 40 GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Node.js:** 20 LTS
- **PostgreSQL:** 16 (local on the same VPS)

If you expect more traffic or a heavier image workload, move PostgreSQL to a managed DB later.

## Step-by-step setup on Timeweb Cloud

### 1) Create the server

- Create a **Cloud VPS** on Timeweb Cloud
- Choose **Ubuntu 22.04 LTS**
- Use the recommended size above
- Add your SSH key if possible

### 2) Connect to the server

```bash
ssh root@YOUR_SERVER_IP
```

### 3) Install system packages

```bash
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib build-essential ca-certificates
```

### 4) Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

### 5) Install PM2

```bash
npm install -g pm2
pm2 -v
```

### 6) Prepare PostgreSQL

You can use the local PostgreSQL instance on the server:

```bash
sudo -u postgres psql
```

Then run:

```sql
CREATE USER drwelnes WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE drwelnes OWNER drwelnes;
GRANT ALL PRIVILEGES ON DATABASE drwelnes TO drwelnes;
\q
```

### 7) Clone the project

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_REPO_URL dr-welnes
cd dr-welnes
```

### 8) Create `.env.production`

```bash
cp deploy/timeweb-cloud/env.production.example .env.production
nano .env.production
```

Fill in:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- optional Telegram credentials

### 9) Make the deploy script executable

```bash
chmod +x deploy/timeweb-cloud/deploy-atomic.sh
```

### 10) Run the first deploy

```bash
bash deploy/timeweb-cloud/deploy-atomic.sh
```

This will:

- copy the repository into a timestamped release directory
- install dependencies inside the release
- generate the Prisma client
- run Prisma migrations
- build the app
- prepare the standalone output and persistent uploads symlink
- switch `current` to the new release only after the build succeeds
- reload PM2 and verify the app with a healthcheck

### 11) Enable PM2 on boot

Run the command PM2 shows for your system, or use:

```bash
pm2 startup
pm2 save
```

> `pm2 startup` prints a command that you must copy and run once.

### 12) Configure Nginx

Copy the config:

```bash
cp deploy/timeweb-cloud/nginx.conf /etc/nginx/sites-available/dr-welnes.conf
ln -s /etc/nginx/sites-available/dr-welnes.conf /etc/nginx/sites-enabled/dr-welnes.conf
nginx -t
systemctl reload nginx
```

If there is a default site blocking port 80, disable it:

```bash
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 13) Set up HTTPS

Use either:

- Timeweb Cloud certificate tools, or
- Certbot on the server

Example with Certbot:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d dr-welnes.ru -d www.dr-welnes.ru
```

### 14) Verify the app

- Open `http://YOUR_DOMAIN` or `https://YOUR_DOMAIN`
- Check PM2:

```bash
pm2 status
pm2 logs dr-welnes
```

## Update process

After each new release:

```bash
cd /var/www/dr-welnes
git pull
bash deploy/timeweb-cloud/deploy-atomic.sh
```

## Notes

- Keep `public/uploads` persistent on the server.
- Do not use `npm run dev` in production.
- If you change database schema, deploy with `prisma migrate deploy` only.
- The app already uses `output: "standalone"`, so this deployment runs the generated standalone server.
- The live PM2 process points at `/var/www/dr-welnes/current`, not the mutable repository root.
