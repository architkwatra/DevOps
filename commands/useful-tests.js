const chalk = require('chalk');
const fs = require('fs');

const sshSync = require('../lib/ssh');
const test_suite = require('../test_suite_analysis/begin');
;
const ymlPath = 'test_suite_analysis/iTrust2-v8/iTrust2/src/main/resources/';

//pipeline useful-tests -c 1000 --gh-user <username> --gh-pass <password>
exports.command = 'useful-tests';
exports.desc = 'Start a jenkins build job in the server';
exports.builder = yargs => {
    yargs.options({
        c: {
            describe: 'iteration count',
            type: 'number'
        },
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
    
    const {c, ghUser, ghPass} = argv;

    (async () => {
        await run(c, ghUser, ghPass);
    })();

};

async function run(count, ghUser, ghPass) {

    if (!ghUser || !ghPass) {
        console.log(chalk.bgRed('Please enter a valid Git user and git password'));
        process.exit(1);
    }

    ghUser = encodeURIComponent(ghUser);
    ghPass = encodeURIComponent(ghPass);
    
    if (fs.existsSync('test_suite_analysis/iTrust2-v8')) {
        let result = await sshSync(`cd /bakerx/test_suite_analysis; sudo rm -rf iTrust2-v8`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
    }
    let result = await sshSync(
        `cd /bakerx/test_suite_analysis; \
        git clone https://${ghUser}:${ghPass}@github.ncsu.edu/engr-csc326-staff/iTrust2-v8.git; \
        cd iTrust2-v8/iTrust2/src/main/resources; \
        cp application.yml.template application.yml`
        , 'vagrant@192.168.33.20'
    );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    let app_yml = fs.readFileSync(ymlPath + 'application.yml');
    let app_yml_replaced = app_yml.toString().replace('password:', 'password: devops10');
    fs.writeFileSync(ymlPath + 'application.yml', app_yml_replaced);

    test_suite.run(count);
}