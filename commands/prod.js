const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');

const sshSync = require('../lib/ssh');

exports.command = 'prod up';
exports.desc = 'Provision and configure the production server';
exports.builder = yargs => {
    yargs.options({ 
        secretKey: {
            describe: 'Secret key for AWS',
            type: 'string'
        },
        accessKey: {
            describe: 'Acess key for AWS',
            type: 'string'
        }
    });
};

exports.handler = async argv => {
    const { secretKey, accessKey } = argv;

    (async () => {

        await run( secretKey, accessKey );

    })();

};

async function run(secretKey, accessKey) {
    if (!secretKey || !accessKey) {
        console.log(chalk.bgRed("Please provide the secret-key and access-key for AWS"))
        console.log(chalk.yellow("usage: prod up --secret-key XXXXXXXXXXXXXX --access-key XXXXXXXXXXXXXXXXX"))
        process.exit();
    }
    console.log(chalk.greenBright(`secret-key = ${secretKey} and access-key = ${accessKey}`));
    let result = sshSync(`ansible-playbook /bakerx/aws/aws.yml -e 'secretKey=${secretKey}' -e 'accessKey=${accessKey}'`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

}