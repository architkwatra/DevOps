# DEVOPS-10 

## Milestone-1

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


You can run the `pipeline setup` command to help you:

1. Provision the configuration server VM (config-srv) (with ip, sync folders)
2. Copy the .vault-pass file over the config-srv
3. Install ansible on the config server.
4. Install jenkins and its requried plugins

*Note*: You must run `pipeline setup` while your cwd is inside the DEVOPS-10 folder in order for the current sync path to be setup.

The output should be similiar to the following:
```bash
$ pipeline setup
Installing configuration server!
Provisioning configuration server...
Creating config-srv using vbox...
Searching between ports 2002 and 2999 for ssh on localhost for this vm.
Excluding the following ports already used by VirtualBox VMS: 2002,2003
Port 2004 is available for ssh on localhost!
Executing VBoxManage import "/home/archit/.bakerx/.persist/images/focal/box.ovf" --vsys 0 --vmname config-srv
Executing VBoxManage modifyvm config-srv --boot1 disk
Executing VBoxManage modifyvm config-srv --biosbootmenu disabled
Executing VBoxManage modifyvm "config-srv" --memory 1024 --cpus 1
Executing VBoxManage modifyvm config-srv  --uart1 0x3f8 4 --uartmode1 disconnected
Executing VBoxManage modifyvm config-srv --nic1 nat
Executing VBoxManage modifyvm config-srv --nictype1 virtio
Using 192.168.33.1 in vboxnet1
Executing VBoxManage hostonlyif ipconfig "vboxnet1" --ip 192.168.33.1
Executing VBoxManage modifyvm "config-srv" --hostonlyadapter2 "vboxnet1"
Executing VBoxManage modifyvm "config-srv" --nic2 hostonly
Executing VBoxManage modifyvm "config-srv" --nictype2 virtio
Executing VBoxManage modifyvm config-srv --natpf1 "guestssh,tcp,,2004,,22"
Executing VBoxManage sharedfolder add config-srv --name "vbox-share-0" --hostpath "/home/archit/Desktop/DEVOPS-10" 
Executing VBoxManage setextradata "config-srv" VBoxInternal2/SharedFoldersEnableSymlinksCreate/vbox-share-0 1
Executing VBoxManage sharedfolder add config-srv --name "vbox-share-1" --hostpath "/" 
Executing VBoxManage setextradata "config-srv" VBoxInternal2/SharedFoldersEnableSymlinksCreate/vbox-share-1 1
Executing VBoxManage startvm config-srv --type emergencystop
Executing VBoxManage startvm config-srv --type headless
⠧ Waiting for VM network to initialize... (can take a few seconds or minutes on slower hosts).
received from ssh server:  SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.1
The VM is now ready. You can run this ssh command to connect to it.
ssh -i "/home/archit/.bakerx/insecure_private_key" vagrant@127.0.0.1 -p 2004 -o StrictHostKeyChecking=no
You may also run 'bakerx ssh config-srv' to connect to the machine.
Running init script...
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
.vault-pass                                   100%   16     0.9KB/s   00:00    
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
envsetup.yml                                  100%  636    45.4KB/s   00:00    
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
vault-vars.yml                                100% 1067   463.2KB/s   00:00    
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
jenkins-api.yml                               100%  276    59.8KB/s   00:00    
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
+ sudo add-apt-repository ppa:ansible/ansible -y
.............
...
```
*Note*: There is more to this output but has been ommitted since it is unnecessary

You can also run `pipeline build checkbox.io -u admin -p admin` in order to:

1. Configure jenkins with the required API keys and environment variables
2. Build and run pipeline jobs for the checkbox.io project
3. See the logs printed in your terminal/bash

If everything is working correctly, you should see the build-pipeline jobs in the jenkins server (http://192.168.33.20:9000)
```

$ pipeline build checkbox.io -u admin -p admin

Running build job...
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
API Token...
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

TASK [Generate API Token] ******************************************************
changed: [localhost]

PLAY RECAP *********************************************************************
localhost                  : ok=3    changed=2    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

Configuration file (jenkins-jobs.ini) created/overwritten.
Pipeline build file (jenkins-jobs.ini) created/overwritten.
load pubkey "/home/archit/.bakerx/insecure_private_key": invalid format
Warning: Permanently added '192.168.33.20' (ECDSA) to the list of known hosts.
INFO:jenkins_jobs.cli.subcommand.update:Updating jobs in ['/bakerx/cm/pipeline-build-job.yml'] ([])
INFO:jenkins_jobs.builder:Number of jobs generated:  1
INFO:jenkins_jobs.builder:Creating jenkins job checkbox.io
INFO:jenkins_jobs.cli.subcommand.update:Number of jobs updated: 1
INFO:jenkins_jobs.builder:Number of views generated:  0
INFO:jenkins_jobs.cli.subcommand.update:Number of views updated: 0
Triggering build.
number: 1
Received 1
...
```
*Note*: There is more to this output but has been ommitted since it is unnecessary

## Experiences while doing the project

* We have faced line endings issues with .sh files while working on windows system. We had run sed cmd to resolve the issue.
* Environment variable set in the VM were not accessible from the jenkins server. Had to define variables again seperately.
* Learned to encrypt the variables and files through ansible vault, which is a great way to protect sensitive content by encrypting it instead of leaving it in plaintext. 
* We had issues while installing the jenkins plugins. Apparantly, jenkins doesn't takes some time to get its installations in line even after restarting it. We     had to add an explicit pause statement after restarting jenkins.


## Future enhancements

* Other than the milestones work, we will be changing the directory names like cm to pipeline.  
* Currently our ansible roles is not making a good use of the variables feature and we will be doing that as well in the future.


## Screencast 

* [X] Create a screencast of Milestone 1:<br>
 <b>Video</b> : [Milestone-1](https://youtu.be/NnN6F5rtTR8)
 
 ## Team Members
 
* Archit Kwatra (akwatra)
* Lokesh Reddy Police (lpolice)
* Venkata Santosh Pavan Pisapati (vpisapa)


