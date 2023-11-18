#!/bin/bash

#stop service
ssh root@142.93.170.167 "source ~/.nvm/nvm.sh && cd /opt/services/stocks-info && forever stop stocks-info"

#copy folders
rsync -avz -e "ssh" ./dist ./prisma root@142.93.170.167:/opt/services/stocks-info/

#copy prisma client
rsync -avz -e "ssh" ./node_modules root@142.93.170.167:/opt/services/stocks-info/node_modules

#copy packages definition and env vars
rsync -avz -e "ssh" ./package.json ./.env ./ecosystem.config.js root@142.93.170.167:/opt/services/stocks-info/

# install/update packages
#ssh root@142.93.170.167 "cd /opt/services/stocks-info && yarn install --ignore-engines"

# start service
ssh root@142.93.170.167 "source ~/.nvm/nvm.sh && cd /opt/services/stocks-info && forever start -a --uid stocks-info ./dist/index.js"