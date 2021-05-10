const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fs = require('fs');
const jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@192.168.33.20:9000', crumbIssuer: true, promisify: true });
const https = require('https');

const scpSync = require('../lib/scp');
const sshSync = require('../lib/ssh');

const configFilePath = 'cm/jenkins-jobs.ini';
const buildJobFilePath = 'cm/pipeline-build-job.yml';

//pipeline build <buildname> -u <admin> -p <admin>
exports.command = 'build [buildjobName]';
exports.desc = 'Start a jenkins build job in the server';
exports.builder = yargs => {
    yargs.options({
        //TODO: not sure of if options is the right way for implementation
        u: {
            describe: 'Jenkins server admin username',
            type: 'string'
        },
        p: {
            describe: 'Jenkins server admin password',
            type: 'string'
        }
    });
};


exports.handler = async argv => {
    
    const {buildjobName, u, p} = argv;

    (async () => {
        await run(buildjobName, u, p);
    })();

};

async function run(buildjobName, userName, password) {

    console.log(chalk.blueBright('Running build job...'));
    var data, MONGO_PORT, MONGO_PASSWORD, MONGO_USER, APP_PORT,MONGO_IP;

    let result = await sshSync('cp vars.sh /bakerx/cm', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    console.log(chalk.blueBright('API Token...'));
    result = await child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/api-token.sh", {shell:true, stdio: 'inherit'});
    result = await sshSync('sudo ansible-playbook --vault-password-file .vault-pass jenkins-api.yml', 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    try {
        data = await fs.readFileSync('cm/vars.sh', 'utf8').toString().match('MONGO_PORT=(.*)\n');;
        MONGO_PORT = data[1];    
    } catch(e) {
        console.log('Error:', e.stack);
    }
    try {
        data = await fs.readFileSync('cm/vars.sh', 'utf8').toString().match('APP_PORT=(.*)\n');;
        APP_PORT = data[1];    
    } catch(e) {
        console.log('Error:', e.stack);
    }
    try {
        data = await fs.readFileSync('cm/vars.sh', 'utf8').toString().match('MONGO_IP=(.*)\n');;
        MONGO_IP = data[1];    
    } catch(e) {
        console.log('Error:', e.stack);
    }
    try {
        data = await fs.readFileSync('cm/vars.sh', 'utf8').toString().match('MONGO_USER=(.*)\n');;
        MONGO_USER = data[1];    
    } catch(e) {
        console.log('Error:', e.stack);
    }
    try {
        data = await fs.readFileSync('cm/vars.sh', 'utf8').toString().match('MONGO_PASSWORD=(.*)\n');;
        MONGO_PASSWORD = data[1];
    } catch(e) {
        console.log('Error:', e.stack);
    }
    // reading the file to get the apiToken
    let tokenObject = fs.readFileSync('.jenkins-api').toString().match('API_KEY:(.*)\n');
    if (tokenObject == null) {
        //generating the API Token
        ans = await sshSync('chmod +x /bakerx/cm/api-token.sh; sh /bakerx/cm/api-token.sh', 'vagrant@192.168.33.20');
        if( ans.error ) { console.log(ans.error); process.exit( ans.status ); }
        tokenObject = fs.readFileSync('.jenkins-api').toString().match('API_KEY:(.*)\n');
    }
    let tokenValue = JSON.parse(tokenObject[1]).data.tokenValue;

    //creating configuration and pipeline build files
    let configText = `[jenkins]\nuser=${userName}\npassword=${tokenValue}\nurl=http://192.168.33.20:9000\n`;
    let buildJobText = `- job:
    name: ${buildjobName}
    project-type: pipeline
    dsl: |
        node {
            withEnv(['APP_PORT=${APP_PORT}',
                'MONGO_PORT=${MONGO_PORT}',
                'MONGO_IP=${MONGO_IP}',
                'MONGO_USER=${MONGO_USER}',
                'MONGO_PASSWORD=${MONGO_PASSWORD}']) {
                
                stage('Source') {
                    deleteDir()
                    sh 'git clone https://github.com/chrisparnin/checkbox.io'
                }
                stage('Build') {
                    sh 'cd checkbox.io/server-side/site; npm install'
                }
                stage('Start-Server') {
                    sh 'cd checkbox.io/server-side/site; nohup node server.js > /dev/null 2>&1 &'
                }
                stage('Test') {
                    sh 'cd checkbox.io/server-side/site; npm test'
                }
            }
        }`

    //sh 'PID=$(ps axl | grep node); kill -9 PID'
    fs.writeFileSync(configFilePath, configText);
    console.log(chalk.yellow('Configuration file (jenkins-jobs.ini) created/overwritten.'));
    fs.writeFileSync(buildJobFilePath, buildJobText);
    console.log(chalk.yellow('Pipeline build file (jenkins-jobs.ini) created/overwritten.'));

    //jenkins-jobs --user admin --password admin update test-pipeline.yml
    result = sshSync(`jenkins-jobs --conf /bakerx/${configFilePath} update /bakerx/${buildJobFilePath}`, 'vagrant@192.168.33.20');
    if( result.error ) { process.exit( result.status ); }

    // triggering the build
    console.log('Triggering build.')
    let buildId = await triggerBuild(buildjobName).catch( e => console.log(e));

    console.log(`Received ${buildId}`);
    let build = await getBuildStatus(buildjobName, buildId);
    console.log( `Build result: ${build.result}` );

    console.log(`Build output`);
    let output = await jenkins.build.log({name: buildjobName, number: buildId});
    console.log( output );

    console.log(`Build log`);
    let log = jenkins.build.logStream(buildjobName, buildId);
    log.on('data', function(text) {
        process.stdout.write(text);
    });
    log.on('error', function(err) {
        console.log('error', err);
    });
    
    // deleting config files
    await fs.unlinkSync(configFilePath);
    await fs.unlinkSync(buildJobFilePath);
    await fs.unlinkSync('cm/vars.sh');
    await fs.unlinkSync('.jenkins-api');
}

async function getBuildStatus(job, id) {
    return new Promise(async function(resolve, reject) {
        console.log(`Fetching ${job}: ${id}`);
        let result = await jenkins.build.get(job, id);
        resolve(result);
    });
}

async function waitOnQueue(id) {
    return new Promise(function(resolve, reject) {
        jenkins.queue.item(id, function(err, item) {
            if (err) throw err;
            // console.log('queue', item);
            if (item.executable) {
                console.log('number:', item.executable.number);
                resolve(item.executable.number);
            } else if (item.cancelled) {
                console.log('cancelled');
                reject('canceled');
            } else {
                setTimeout(async function() {
                    resolve(await waitOnQueue(id));
                }, 5000);
            }
        });
    });
}
  
async function triggerBuild(job) {
    let queueId = await jenkins.job.build(job);
    let buildId = await waitOnQueue(queueId);
    return buildId;
}
