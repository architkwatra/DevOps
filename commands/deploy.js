const chalk = require('chalk');
const sshSync = require('../lib/ssh');
const child = require('child_process');

exports.command = 'deploy [deployName]';
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
    
    const {deployName, i} = argv;

    (async () => {
        await run(deployName, i);
    })();

};

async function run(deployName, inventoryConfigFile) {

    if (!inventoryConfigFile) {
        inventoryConfigFile = "/bakerx/aws/inventory.ini";
    } else {
        setupPrivateKey(inventoryConfigFile);
        inventoryConfigFile = "/home/vagrant/inventory.ini";
    }

    if (deployName === 'checkbox.io') {
        
        console.log(chalk.yellowBright("inventoryConfigFile = ", inventoryConfigFile));

        console.log(chalk.greenBright("Setting up the checkbox app"));
        let result = sshSync(`ansible-playbook /bakerx/ansible/checkbox/checkbox_setup.yml -i ${inventoryConfigFile}`, "vagrant@192.168.33.20");
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        console.log(chalk.greenBright("Deploying the checkbox app"));
        result = sshSync(`ansible-playbook --vault-password-file .vault-pass /bakerx/ansible/checkbox/checkbox_deploy.yml -i ${inventoryConfigFile}`, "vagrant@192.168.33.20");
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }
    else if (deployName === 'iTrust'){
        console.log(chalk.greenBright("iTrust deploying"));
        let result = sshSync(`ansible-playbook /bakerx/ansible/itrust/itrust_deploy.yml -i ${inventoryConfigFile}`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }
    else {
        console.log("Please enter either checkbox.io or iTrust");
    }
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