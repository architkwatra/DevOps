#!/bin/bash
# Exit on error
#set -e
flag=0
for file in $(find .. -type f -name '*.js' | grep -v node_modules | grep -v analysis.js)
do
    node analysis.js ${file}
    value=`cat output.txt`
    if [ $value == -1 ]
    then
        flag=-1
    fi
done
if [ $flag == -1 ]
then
   echo $'\nStatic Analysis Status: Failed\n[BUILD FAILED]'
   echo $'***Violations Report***\n'
   cat violations.txt
   rm violations.txt
   rm output.txt
   exit 1
else
   echo 'Static Analysis Status: Passed'
   exit 0
fi