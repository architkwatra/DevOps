# DEVOPS-10 

## Milestone-3

### Get started

Clone this repo:

```bash
git clone https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-10.git
```

Install the node.js packages.

```
npm install
sudo npm link
```
*Note*: 'sudo' here is used for running the command as a root user in linux (and mac). In windows you can run the command as an administrator user.

create a .vault-pass file in the DEVOPS-10 directory

```
echo csc-devops-2020 > .vault-pass
```


You can run the `pipeline setup ` command to help you:

1. Provision the configuration server VM (config-srv) (with ip, sync folders)
2. Copy the .vault-pass file over the config-srv
3. Install ansible on the config server.
4. Install jenkins and its requried plugins
5. Store the github credentials passed in the command line into the jenkins credentials manager

*Note*: You must run `pipeline setup --gh-user <username> --gh-pass <password>` while your cwd is inside the DEVOPS-10 folder in order for the current sync path to be setup.

<details>
    <summary> (Click here) The output should be similiar to the following :</summary>
   
   ```bash
    $ pipeline setup --gh-user user --gh-pass pass

    Installing configuration server!
    Provisioning configuration server...
    Creating config-srv using vbox...
    Searching between ports 2002 and 2999 for ssh on localhost for this vm.
    Excluding the following ports already used by VirtualBox VMS: 
    Port 2002 is available for ssh on localhost!
    Executing VBoxManage import "/home/archit/.bakerx/.persist/images/focal/box.ovf" --vsys 0 --vmname config-srv
    Executing VBoxManage modifyvm config-srv --boot1 disk
    Executing VBoxManage modifyvm config-srv --biosbootmenu disabled
    Executing VBoxManage modifyvm "config-srv" --memory 4096 --cpus 1
    Executing VBoxManage modifyvm config-srv  --uart1 0x3f8 4 --uartmode1 disconnected
    Executing VBoxManage modifyvm config-srv --nic1 nat
    Executing VBoxManage modifyvm config-srv --nictype1 virtio
    Using 192.168.33.1 in vboxnet1
    Executing VBoxManage hostonlyif ipconfig "vboxnet1" --ip 192.168.33.1
    Executing VBoxManage modifyvm "config-srv" --hostonlyadapter2 "vboxnet1"
    Executing VBoxManage modifyvm "config-srv" --nic2 hostonly
    Executing VBoxManage modifyvm "config-srv" --nictype2 virtio
    Executing VBoxManage modifyvm config-srv --natpf1 "guestssh,tcp,,2002,,22"
    Executing VBoxManage sharedfolder add config-srv --name "vbox-share-0" --hostpath "/home/archit/Desktop/Drive/NCSU/SEM_4/CSC-519_DevOps/DEVOPS-10" 
    Executing VBoxManage setextradata "config-srv" VBoxInternal2/SharedFoldersEnableSymlinksCreate/vbox-share-0 1
    Executing VBoxManage sharedfolder add config-srv --name "vbox-share-1" --hostpath "/" 
    Executing VBoxManage setextradata "config-srv" VBoxInternal2/SharedFoldersEnableSymlinksCreate/vbox-share-1 1
    Executing VBoxManage startvm config-srv --type emergencystop
    Executing VBoxManage startvm config-srv --type headless
    ⠙ Waiting for VM network to initialize... (can take a few seconds or minutes on slower hosts).
    received from ssh server:  SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1

    The VM is now ready. You can run this ssh command to connect to it.
    ssh -i "/home/archit/.bakerx/insecure_private_key" vagrant@127.0.0.1 -p 2002 -o StrictHostKeyChecking=no
    You may also run 'bakerx ssh config-srv' to connect to the machine.
    Running init script...
    load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
    .vault-pass                                                                                                         100%   16     4.0KB/s   00:00    
    load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
    envsetup.yml                                                                                                        100%  636    15.2KB/s   00:00    
    load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
    vault-vars.yml                                                                                                      100% 1067    37.0KB/s   00:00    
    load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
    jenkins-api.yml                                                                                                     100%  537    51.9KB/s   00:00    
    load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
    + sudo add-apt-repository ppa:ansible/ansible -y
    Hit:1 http://archive.ubuntu.com/ubuntu focal InRelease
    Get:2 http://ppa.launchpad.net/ansible/ansible/ubuntu focal InRelease [18.0 kB]

    .............
    ...
```
</details>

*Note*: There is more to this output but has been ommitted since it is unnecessary


You can also run `pipeline prod up --secret-key $skey --access-key $akey` in order to:

1. Provision the 3 instances on AWS - iTrust, Checkbox and monitoring
2. Generate the inventory.ini file for the ansible playbooks
3. Generate the private key for connecting to theses instances

```
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
[WARNING]: provided hosts list is empty, only localhost is available. Note that
the implicit localhost does not match 'all'

PLAY [localhost] ***************************************************************

TASK [Gathering Facts] *********************************************************
ok: [localhost]

TASK [aws : Provision the AWS instance] ****************************************
changed: [localhost]

PLAY RECAP *********************************************************************
localhost                  : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0 

```


You can also run `pipeline build iTrust -u <admin> -p <admin>` in order to:

1. Configure jenkins with the required API keys and environment variables
2. Build and run pipeline jobs for the iTrust project
3. Run all the unit and integration tests for the iTrust app

If everything is working correctly, you should see the build-pipeline jobs in the jenkins server (http://192.168.33.20:9000)

```
$ pipeline build iTrust -u admin -p admin

load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
API Token...
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
jenkins-api.yml                                                                                                     100%  537     6.9KB/s   00:00    
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
[WARNING]: provided hosts list is empty, only localhost is available. Note that
the implicit localhost does not match 'all'

PLAY [jenkins run] *************************************************************

TASK [Gathering Facts] *********************************************************
ok: [localhost]

TASK [chmod api-token.sh] ******************************************************
[WARNING]: Consider using the file module with mode rather than running
'chmod'.  If you need to use command because file is insufficient you can add
'warn: false' to this command task or set 'command_warnings=False' in
ansible.cfg to get rid of this message.
changed: [localhost]

TASK [Generate API Token 1] ****************************************************
skipping: [localhost]

TASK [Generate API Token 2] ****************************************************
changed: [localhost]

PLAY RECAP *********************************************************************
localhost                  : ok=3    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   

Running build job for iTrust...
Configuration file (jenkins-jobs.ini) created/overwritten.
Pipeline build file (jenkins-jobs.ini) created/overwritten.
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
INFO:jenkins_jobs.cli.subcommand.update:Updating jobs in ['/bakerx/cm/pipeline-build-job.yml'] ([])
INFO:jenkins_jobs.builder:Number of jobs generated:  1
INFO:jenkins_jobs.cli.subcommand.update:Number of jobs updated: 0
INFO:jenkins_jobs.builder:Number of views generated:  0
INFO:jenkins_jobs.cli.subcommand.update:Number of views updated: 0
Triggering build.
number: 2
Received 2
Fetching iTrust: 2
Build result: null
Build output
Started by user admin
Running in Durability level: MAX_SURVIVABILITY
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/lib/jenkins/workspace/iTrust
[Pipeline] {
[Pipeline] withCredentials
Masking supported pattern matches of $Username or $Password
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Build)
[Pipeline] deleteDir
[Pipeline] sh
+ git clone --branch main https://****:****@github.ncsu.edu/engr-csc326-staff/iTrust2-v8.git
Cloning into 'iTrust2-v8'...
+ cd iTrust2-v8/iTrust2/src/main/resources
+ cp application.yml.template application.yml
+ sed -ir s/^[#]*[[:space:]]*password:.*/    password: devops10/ application.yml
+ cd ../../../
+ rm pom.xml
+ cp ../../../../../../../bakerx/pom/pom.xml pom.xml
+ ls
debug.log
mvnw
mvnw.cmd
pom.xml
src
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Test)
[Pipeline] sh
+ cd iTrust2-v8/iTrust2
+ mvn clean test integration-test checkstyle:checkstyle

Build log
Started by user admin
Running in Durability level: MAX_SURVIVABILITY
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/lib/jenkins/workspace/iTrust
[Pipeline] {
[Pipeline] withCredentials
Masking supported pattern matches of $Username or $Password
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Build)
[Pipeline] deleteDir
[Pipeline] sh
+ git clone --branch main https://****:****@github.ncsu.edu/engr-csc326-staff/iTrust2-v8.git
Cloning into 'iTrust2-v8'...
+ cd iTrust2-v8/iTrust2/src/main/resources
+ cp application.yml.template application.yml
+ sed -ir s/^[#]*[[:space:]]*password:.*/    password: devops10/ application.yml
+ cd ../../../
+ rm pom.xml
+ cp ../../../../../../../bakerx/pom/pom.xml pom.xml
+ ls
debug.log
mvnw
mvnw.cmd
pom.xml
src
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Test)
[Pipeline] sh
+ cd iTrust2-v8/iTrust2
+ mvn clean test integration-test checkstyle:checkstyle
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by com.google.inject.internal.cglib.core.$ReflectUtils$1 (file:/usr/share/maven/lib/guice.jar) to method java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain)
WARNING: Please consider reporting this to the maintainers of com.google.inject.internal.cglib.core.$ReflectUtils$1
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operation
...
```
*Note*: There is more to this output but has been ommitted since it is unnecessary

## Test suite analysis for detecting useful tests
* Performed fuzzing mutations on randomly selected java files with a certain probability for a certain number of given iterations.
* After fuzzing the tests are run to check if the mutation was successful in catching an error in the enterprise application.
* At the end, calculated the mutation coverage and printed the test cases by the order of their failed counts.

The output file can be found at ***test_suite_analysis/.test-output***

*Note*: You must run `pipeline setup --gh-user <username> --gh-pass <password>` while your cwd is inside the DEVOPS-10 folder.

The output should be similiar to the following:
```bash
$ pipeline useful-tests -c <count> --gh-user <username> --gh-pass <password>
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Cloning into 'iTrust2-v8'...
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Fuzzing 'async function testingFunction () {
    let result = await sshSync(`cd ${repoPath}; mvn clean test >> test_suite_analysis/.test-output`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}' with 1 randomly generated-inputs.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
. . .
Overall mutation coverage: 30/1000 (3%) mutations caught by the test suite.
Useful tests
============

2/100 edu.ncsu.csc.iTrust2.api.APIOfficeVisitTest.testOfficeVisitAPI

1/100 edu.ncsu.csc.iTrust2.api.APIAppointmentRequestTest.testAppointmentRequestAPI

1/100 edu.ncsu.csc.iTrust2.api.APIAppointmentRequestTest.testDeleteNonExistentAppointment

1/100 edu.ncsu.csc.iTrust2.api.APIAppointmentRequestTest.testGetNonExistentAppointment

1/100 edu.ncsu.csc.iTrust2.api.APIDiagnosisTest.testDiagnoses

1/100 edu.ncsu.csc.iTrust2.api.APIICDCodeTest.testCodeAPI

1/100 edu.ncsu.csc.iTrust2.api.APIOfficeVisitTest.testGetNonExistentOfficeVisit

1/100 edu.ncsu.csc.iTrust2.api.APIOfficeVisitTest.testPreScheduledOfficeVisit

1/100 edu.ncsu.csc.iTrust2.api.APIPatientTest.testPatientAsPatient

1/100 edu.ncsu.csc.iTrust2.api.APIPatientTest.testPatientAPI

1/100 edu.ncsu.csc.iTrust2.api.APIPersonnelTest.testPersonnelAPI

1/100 edu.ncsu.csc.iTrust2.api.APIUserTest.testUpdateUsers

1/100 edu.ncsu.csc.iTrust2.api.APIUserTest.testCreateUsers

0/100 edu.ncsu.csc.iTrust2.api.APIAppointmentRequestTest.testCreateBadAppointmentRequest

0/100 edu.ncsu.csc.iTrust2.api.APIDrugTest.testDrugAPI

0/100 edu.ncsu.csc.iTrust2.api.APIHospitalTest.testGetNonExistentHospital

0/100 edu.ncsu.csc.iTrust2.api.APIHospitalTest.testHospitalAPI

0/100 edu.ncsu.csc.iTrust2.api.APIHospitalTest.testPermissions

0/100 edu.ncsu.csc.iTrust2.api.APIPatientTest.testPatientUnauthenticated

0/100 edu.ncsu.csc.iTrust2.api.APIPatientTest.testGetNonExistentPatient

0/100 edu.ncsu.csc.iTrust2.api.APIPersonnelTest.testGetNonExistentPersonnel

0/100 edu.ncsu.csc.iTrust2.api.APIPersonnelTest.testGetByRole

0/100 edu.ncsu.csc.iTrust2.api.APIPersonnelTest.testRoleFiltering

0/100 edu.ncsu.csc.iTrust2.api.APIUserTest.testCreateInvalidUsers

0/100 edu.ncsu.csc.iTrust2.unit.ICDCodeTest.testCodes

0/100 edu.ncsu.csc.iTrust2.unit.ICDCodeTest.testInvalidCodes

0/100 edu.ncsu.csc.iTrust2.unit.LogEntryTest.testCreateLogEntries

0/100 edu.ncsu.csc.iTrust2.unit.OfficeVisitTest.testOfficeVisit

0/100 edu.ncsu.csc.iTrust2.unit.PatientTest.testCreatePatientRecord

0/100 edu.ncsu.csc.iTrust2.unit.PersonnelTest.testPersonnel

0/100 edu.ncsu.csc.iTrust2.unit.UserTest.testIllegalRoleCombinations

0/100 edu.ncsu.csc.iTrust2.unit.UserTest.testUserRoles
```
*Note*: Please note that the output above has been cut short so that only the essential is shown.

## Deploying

#### *Note*: If testing things locally, the path changes in the MAC OS. Please change the paths of the actions accordingly for everything to run on MAC OS.

#### Checkbox Application

* The following steps were taken while deploying the checkbox application-

   1. Setup the environment in the cloud virtual machine.
    
   2. Installed the **agent** that uses redis to constantly publish the data to the monitoring dashboard.
    
   3. Cloned the checkbox application and ran the checkbox application using **forever** application.

* To test this yourselves, please enter the following command to deploy the checkbox application `pipeline deploy checkbox.io`.

  <details>
    
    <summary> (Click here) The output looks like this </summary>
    
    ```bash
    
    C:\DEVOPS-10>pipeline deploy checkbox.io -i inventory.ini
    inventoryConfigFile =  inventory.ini
    Setting up the checkbox app
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.

    PLAY [checkbox] ****************************************************************

    TASK [Gathering Facts] *********************************************************
    ok: [192.168.33.23]

    TASK [node : Install Packages] *************************************************
    
    PLAY RECAP *********************************************************************
    192.168.33.23              : ok=1    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0

    Deploying the checkbox app
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.

    PLAY [checkbox] ****************************************************************

    TASK [Gathering Facts] *********************************************************
    ok: [192.168.33.23]

    TASK [deploy : check if checkbox.io already exists] ****************************
    changed: [192.168.33.23]

    TASK [deploy : clone Checkbox.io] **********************************************
    changed: [192.168.33.23]

    TASK [deploy : Install NPM Dependencies for Checkbox.io] ***********************
    changed: [192.168.33.23]

    TASK [deploy : Edit the default file] ******************************************
    changed: [192.168.33.23]

    TASK [deploy : Copy the default file to nginx] *********************************
    ok: [192.168.33.23]

    TASK [deploy : Copy conf file to nginx] ****************************************
    ok: [192.168.33.23]

    TASK [deploy : Restart Nginx] **************************************************
    changed: [192.168.33.23]

    TASK [deploy : Restarting nginx using forever] *********************************
    changed: [192.168.33.23]

    TASK [monitor_agent : Setting the MONITOR_IP as an environment variable] *******
    ok: [192.168.33.23]

    TASK [monitor_agent : Get the gpg key for NodeJS] ******************************
    ok: [192.168.33.23]

    TASK [monitor_agent : Install NodeJS (v14) LTS] ********************************
    ok: [192.168.33.23]

    TASK [monitor_agent : Install NodeJS] ******************************************
    ok: [192.168.33.23]

    TASK [monitor_agent : Copy the agent] ******************************************
    ok: [192.168.33.23]

    TASK [monitor_agent : Install forever package] *********************************
    changed: [192.168.33.23]

    TASK [monitor_agent : Install the packages for the agent] **********************
    changed: [192.168.33.23]

    TASK [monitor_agent : Start the agent service] *********************************
    changed: [192.168.33.23]

    PLAY RECAP *********************************************************************
    192.168.33.23              : ok=17   changed=9    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
    ```
</details>

#### iTrust Application

You can also run `pipeline deploy itrust` in order to:

1. Install iTrust related dependencies in the aws instance for iTrust
2. Deploy the war file created from the build step
3. Access the deployed iTrust application at `http://<ip_address>:8080/iTrust2`

*Important Note*: You might have to change the path of the war file created from the build command if you are a mac user. The path needs to be changed in DEVOPS-10/ansible/itrust/roles/tomcat/tasks/main.yml (Second last play of the playbook - "Copy the war file")


## Monitoring Dashboard

* Implemented a monitoring dashboard to show the metrics of the Virtual Machines for **iTrust** and **checkbox** applications where we see the following metrics-
    
    1. HTTP Status.
    
    2. Latency.
    
    3. Memory% being utilized.
    
    4. CPU% being utilized.

* Implemented this using **redis pub-sub** method where the client VMs of iTrust and checkbox applications are the publishers of the data and the monitoring dashboard application is the subscriber of that data.

* The status of each server is either **red** or **green** or **yellow**. It indicates the health of the server and is based on the score that is assigned based on their individual metrics.

* The sample output is shown here-
![img](monitor_dashboard.png)

* To test this section yourself. Please enter the following command `pipeline monitor-setup -i inventory.ini`.

    <details> 
    
    <summary> (Click here) The output will be as below. </summary>
    
    ```bash
    C:\DEVOPS-10>pipeline monitor-setup -i inventory.ini
    monitor application deploying
    Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.

    PLAY [ansible playbook to deploy the monitoring application] *******************

    TASK [Gathering Facts] *********************************************************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Setting the CHECKBOX_IP as an environment variable] *****
    ok: [192.168.33.24]

    TASK [deploy_monitor : Setting the ITRUST_IP as an environment variable] *******
    ok: [192.168.33.24]

    TASK [deploy_monitor : Get the gpg key for NodeJS] *****************************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Install NodeJS (v14) LTS] *******************************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Install NodeJS] *****************************************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Install forever] ****************************************
    changed: [192.168.33.24]

    TASK [deploy_monitor : Install redis server] ***********************************
    [WARNING]: Consider using the apt module rather than running 'apt-get'.  If you
    need to use command because apt is insufficient you can add 'warn: false' to
    this command task or set 'command_warnings=False' in ansible.cfg to get rid of
    this message.
    changed: [192.168.33.24]

    TASK [deploy_monitor : Copy workshop to monitor virtual machine] ***************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Installing the dependencies for dashboard] **************
    changed: [192.168.33.24]

    TASK [deploy_monitor : Start redis server] *************************************
    changed: [192.168.33.24]

    TASK [deploy_monitor : Open connection for the redis configuration] ************
    ok: [192.168.33.24]

    TASK [deploy_monitor : Restart redis server service] ***************************
    changed: [192.168.33.24]

    TASK [deploy_monitor : Run the dashboard] **************************************
    changed: [192.168.33.24]

    PLAY RECAP *********************************************************************
    192.168.33.24              : ok=14   changed=6    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
    ```
 
 </details>

## Canary Analysis

* Implemented Netflix style red-black deployment with canary analysis of a microservice.
* Created an automated analysis that can perform the following tasks and generates canary score and report
    - Constructed a computing environment with three VMs as shown in diagram (locally)
    - Generated load to the proxy server by requesting the /preview service.
    - For the first 1 minute, load is sent to the blue instance, collects health metrics.
    - Next, sends traffic to the green instance for 1 minute, collects health metrics.
    - Reports a statistical comparision between health values and computes a canary score. Finally, Determines whether canary has "passed" or "failed".

* Sample Output:
![canary](https://github.ncsu.edu/cscdevops-spring2021/DEVOPS-10/blob/master/canary.PNG)


## Experiences while doing the project

* We faced issues in the createCredentials API for jenkins. It has a very strict syntax and it seems it is also related to the crumb and api_token generation commands as well.
* We faced issues in the iTrust application waiting time. We are explicitly changing the pom.xml for this.
* We have faced line endings issues with .sh files while working on windows system. We had run sed cmd to resolve the issue.
* Environment variable set in the VM were not accessible from the jenkins server. Had to define variables again seperately.
* Learned to encrypt the variables and files through ansible vault, which is a great way to protect sensitive content by encrypting it instead of leaving it in plaintext.
* While working on static analysis requirements, exploring the syntax tree for sample code using the esprima parser realing helped to understand and come up with the logic to satisfy the requirements.
* While performing the Test Suite Analysis, the execution would sometimes get stuck in a repeating compilation error loop.
* We had issues while installing the jenkins plugins. Apparantly, jenkins doesn't takes some time to get its installations in line even after restarting it. We had to add an explicit pause statement after restarting jenkins.
* While performing the Test Suite Analysis, we observed that the procedure can take a lot of time for the output to show. Optimizing the process is important. One such way is to use hashsets and hashmaps for the implementation.
* While creating the metrics dashboard, we learned about the redis usage for pub-sub where the publishers are the client VMs of checkbox and iTrust, and the subscriber is the deployed monitor VM.
* While performing the canary analysis, faced a lot of issues while geenrating load.Had to create a seperate .sh file and copy it onto the remote vm. So, that it will run successfuly.

## Future enhancements

* Other than the milestones work, we will be changing the directory names like cm to pipeline.  
* We haven't made use of try catch blocks and our setup commands could break due to some error.


## Screencast 

* [X] Create a screencast of Milestone 1:<br>
 <b>Video</b> : [Milestone-1](https://youtu.be/NnN6F5rtTR8)
 * [X] Create a screencast of Milestone 2:<br>
 <b>Video</b> : [Milestone-2](https://youtu.be/dHvkvHW9CNI)
  * [X] Create a screencast of Milestone 3:<br>
 <b>Video</b> : [Milestone-3](https://drive.google.com/file/d/1tIFgvtN5Gfl3w0Dma5KEwVvtYVrOi9X-/view?usp=sharing)
   * [X] Final Demo Video:<br>
 <b>Video</b> : [Final-Demo]()

 ## Team Members
 
* Archit Kwatra (akwatra)
* Lokesh Reddy Police (lpolice)
* Venkata Santosh Pavan Pisapati (vpisapa)


