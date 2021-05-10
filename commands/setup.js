const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const sshSync = require('../lib/ssh');

exports.command = 'setup';
exports.desc = 'Provision and configure the configuration server';
exports.builder = yargs => {
    yargs.options({ 
        ghUser: {
            describe: 'Github username',
            type: 'string'
        },
        ghPass: {
            describe: 'Github password',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    const { ghUser, ghPass } = argv;

    (async () => {

        await run( ghUser, ghPass );

    })();

};

async function run(ghUser, ghPass) {
    if (ghUser === undefined || ghPass === undefined) {
        console.log(chalk.bgRed("Please enter the github username and password")); 
        process.exit( 1 );
    }

    console.log(chalk.greenBright('Installing configuration server!'));
    console.log(chalk.blueBright('Provisioning configuration server...'));
    let result = await child.spawnSync(`bakerx`, `run config-srv focal --ip 192.168.33.20 --sync --memory 3074`.split(' '), {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    await new Promise(resolve => setTimeout(resolve, 5000));

    result = await child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/server-init.sh", {shell:true, stdio: 'inherit'});

    console.log(chalk.blueBright('Running init script...'));

    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key .vault-pass vagrant@192.168.33.20:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key ansible/envsetup.yml vagrant@192.168.33.20:~/", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key ansible/vault-vars.yml vagrant@192.168.33.20:~/", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key ansible/jenkins-api.yml vagrant@192.168.33.20:~/", {shell:true, stdio: 'inherit'});
    result = await sshSync('/bakerx/cm/server-init.sh', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    await buildEnvironmentSetup(ghUser, ghPass);
}

async function buildEnvironmentSetup(ghUser, ghPass){
    ghUser = encodeURIComponent(ghUser);
    ghPass = encodeURIComponent(ghPass);
    
    let result = await sshSync('sudo systemctl status jenkins', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.keyword('pink')(`Running build enviroment scripts...`));
    result = await sshSync('sudo apt-get --assume-yes update', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    console.log(chalk.blueBright('Installing nodejs...'));
    result = await sshSync('sudo apt-get install --assume-yes nodejs npm git', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    // console.log(chalk.blueBright('Installing and running mongodb...'));
    // result = await sshSync('sudo apt install -y mongodb', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }
    // result = await sshSync('sudo service mongodb start', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }
    // result = await sshSync('sudo systemctl status mongodb', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }
    // result = await sshSync('sudo mongo admin db.js', 'vagrant@192.168.33.20');
    // if( result.error ) { console.log(result.error); process.exit( result.status ); }

    //build job related work
    console.log(chalk.blueBright('Jenkins Job Builder...'));
    result = await sshSync('sudo apt --assume-yes install python3-pip', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync('sudo apt --assume-yes install requests==2.19.1', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync('sudo apt --assume-yes install jenkins-job-builder', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    //restart jenkins
    console.log(chalk.blueBright('Restart Jenkins...'));
    result = await sshSync('sudo ansible-playbook /bakerx/cm/restart-jenkins.yml', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    //create API Token
    console.log(chalk.blueBright('API Token...'));
    result = child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/api-token.sh", {shell:true, stdio: 'inherit'});
    result = sshSync(`sudo ansible-playbook --vault-password-file .vault-pass jenkins-api.yml -e 'user=${ghUser}' -e 'pwd=${ghPass}'`, 'vagrant@192.168.33.20');
                                                                                                        
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    //restart jenkins
    console.log(chalk.blueBright('Restart Jenkins...'));
    result = await sshSync('sudo ansible-playbook /bakerx/cm/restart-jenkins.yml', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    try {
        fs.unlinkSync('.jenkins-api');
    } catch {
        console.log(chalk.bgRed("Either vault-pass file not created or some issue with jenkins api token generation"))
    }
    console.log(chalk.green("Starting the itrust setup"));
    setupItrust();
}

function setupItrust() {
    result = sshSync('sudo ansible-playbook /bakerx/ansible/itrust/itrust_setup.yml', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}
