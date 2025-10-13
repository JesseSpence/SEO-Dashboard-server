#!/bin/bash
# Navigate into app folder
cd /home/ec2-user/app/server

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null
then
  sudo npm install -g pm2
fi

# Stop previous instance (if any)
pm2 delete all || true

# Start the app
pm2 start npm --name "my-api" -- start

# Save PM2 state so it restarts on reboot
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user
