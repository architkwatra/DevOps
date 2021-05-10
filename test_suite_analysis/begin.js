const mtfuzz = require('./driver').mtfuzz;
const fs = require('fs');
const sshSync = require('../lib/ssh');
const chalk = require('chalk');

let repoPath = '/bakerx/test_suite_analysis/iTrust2-v8/iTrust2/';

async function testingFunction () {
    let result = await sshSync(`cd ${repoPath}; mvn clean test >> test_suite_analysis/.test-output`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
}

var run = function run(count) {
    if (fs.existsSync('test_suite_analysis/.test-output')) {
        fs.unlinkSync('test_suite_analysis/.test-output');
    }
    const runs = count > 0 ? count : 1000;
    // Fuzz function 1000 (or given) times, with given seed string inputs.
    mtfuzz(runs, repoPath, testingFunction);
}

module.exports.run = run;