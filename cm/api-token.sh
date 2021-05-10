#!/bin/bash
CRUMB=$(curl http://192.168.33.20:9000/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\) \
-c cookies.txt \
--user "$1:$2")

API_KEY=$(curl 'http://192.168.33.20:9000/user/admin/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken' \
-H "$CRUMB" \
--data 'newTokenName=adminToken' \
--user "$1:$2" \
-b cookies.txt)

echo "\nAPI_KEY:${API_KEY}" > /bakerx/.jenkins-api
