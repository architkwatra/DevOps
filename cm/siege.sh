#!/bin/bash
# Trace commands as we run them:
set -x
siege -c 1 -t60s --content-type="application/json" "http://$1:3090 POST < checkbox.io-micro-preview/test/resources/survey.json" &> "load-test-$2.txt"
cat "load-test-$2.txt"