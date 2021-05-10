#!/bin/bash


# Trace commands as we run them:
set -x
rm -rf checkbox.io-micro-preview
git clone -b $1 https://github.com/chrisparnin/checkbox.io-micro-preview
cd checkbox.io-micro-preview
npm install
pm2 delete index.js
pm2 status
pm2 start index.js