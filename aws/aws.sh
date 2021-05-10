#!/bin/bash

# boto=$(sudo pip3 install boto3)

sudo pip3 install boto3

export AWS_ACCESS_KEY_ID=$1

export AWS_SECRET_ACCESS_KEY=$2

# echo $1

# echo $2

python3 aws.py

# cd /bakerx/aws
# pwd
# ls

# ansible-playbook itrust.yml -i inventory.ini

# echo "${op}" > /bakerx/aws/op.txt
# echo "${aws_exec}" > /bakerx/aws/aws_exec.txt