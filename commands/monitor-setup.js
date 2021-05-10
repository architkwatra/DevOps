const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');
const jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@192.168.33.20:9000', crumbIssuer: true, promisify: true });
const https = require('https');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

exports.command = 'monitor-setup';
exports.desc = 'Start a jenkins build job in the server';
exports.builder = yargs => {
    yargs.options({
        i: {
            describe: 'Inventory configuration file',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    
    const {i} = argv;

    (async () => {
        await run(i);
    })();

};

async function run(inventoryConfigFile) {
    if (!inventoryConfigFile) {
        inventoryConfigFile = "/bakerx/aws/inventory.ini";
    } else {        
        setupPrivateKey();
        inventoryConfigFile = "/home/vagrant/inventory.ini";
    }

    console.log(chalk.green(`Picking inventory file from ${inventoryConfigFile}`));

    console.log("monitor application deploying");
    // result = sshSync(`ansible-playbook /bakerx/ansible/monitor.yml -i /bakerx/inventory.ini --vault-password-file /bakerx/.vault_pass`, 'vagrant@192.168.33.20');
    result = sshSync(`ansible-playbook /bakerx/ansible/monitor.yml -i ${inventoryConfigFile}`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}


function setupPrivateKey(inventoryConfigFile) {

    // console.log(chalk.red("Deleting the .bakerx folder on remote"));
    // let result = sshSync('rm -rf ~/.bakerx', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.errror); process.exit( result.status ); }

    // console.log(chalk.red("Deleting the checkbox folder on local"));
    // result = child.spawnSync("rm -rf ~/checkbox", {shell:true, stdio: 'inherit'});
    // if( result.error ) { console.log(result.errror); process.exit( result.status ); }

    console.log(chalk.magenta("Copying the inventory file"));
    result = child.spawnSync(`scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key ${inventoryConfigFile} vagrant@192.168.33.20:~/inventory.ini`, {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.green("mkdir checkbox folder on local"));
    result = child.spawnSync("mkdir ~/checkbox", {shell:true, stdio: 'inherit'});

    console.log(chalk.green("copying the private key to the checkbox folder"));
    result = child.spawnSync("cp ~/.bakerx/insecure_private_key ~/checkbox/insecure_private_key", {shell:true, stdio: 'inherit'});
    
    console.log(chalk.green("copying the checkbox folder to the remote machine"));
    result = child.spawnSync("scp -r -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key ~/checkbox vagrant@192.168.33.20:~/.bakerx", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); } 
}