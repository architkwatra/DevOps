#!/bin/bash

# Exit on error
set -e

# Trace commands as we run them:
set -x

# Script used to initialize your ansible server after provisioning.
sudo add-apt-repository ppa:ansible/ansible -y
sudo apt-get update
sudo apt-get install ansible -y

cd /bakerx/ansible/
# mkdir roles
# cd /roles/
# ansible-galaxy install -p roles geerlingguy.java
# ansible-galaxy install -p roles geerlingguy.jenkins
# cd ../
ansible-playbook inventory.yml

cd ~

ansible-playbook --vault-password-file .vault-pass envsetup.yml

cat vars.sh >> .bashrc


# ansible-galaxy install flyapen.jenkins
# git clone https://github.com/ICTO/ansible-jenkins.git roles

# ansible-galaxy install -p roles geerlingguy.jenkins

# ansible-playbook jenkins.yml

# ansible-playbook -i ansible.host jenkins.yml