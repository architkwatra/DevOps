#!/bin/bash
cd /bakerx/test_suite_analysis/iTrust2-v8/iTrust2/src/main/resources
cp application.yml.template application.yml
sed -ir "s/^[#]*[[:space:]]*password:.*/   password: devops10/" application.yml