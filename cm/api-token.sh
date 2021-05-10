#!/bin/bash
CRUMB=$(curl http://192.168.33.20:9000/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\) \
-c cookies.txt \
--user "$1:$2")

echo $CRUMB > crumb.txt

API_KEY=$(curl 'http://192.168.33.20:9000/user/admin/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken' \
-H "$CRUMB" \
--data 'newTokenName=adminToken' \
--user "$1:$2" \
-b cookies.txt)

echo "\nAPI_KEY:${API_KEY}" > /bakerx/.jenkins-api

credentials=$(curl -H "$CRUMB" -b cookies.txt -u $1:$2 -X POST http://192.168.33.20:9000/credentials/store/system/domain/_/createCredentials \
 --data-urlencode 'json={ 
    "": "0", 
    "credentials": { 
        "scope": "GLOBAL", 
        "id": "itrustidpass",
        "username": "'$3'",
        "password": "'$4'",
        "description": "Github Pass to access iTrust", 
        "$class": "com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl"}}')

echo $credentials > credres.txt