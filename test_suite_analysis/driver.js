const fs = require('fs');
const path = require('path');
const Random = require('random-js');
const chalk = require('chalk');
const mutateStr = require('./mutate').mutateString;

const sshSync = require('../lib/ssh');

class mutater {
    static random() {
        return mutater._random || fuzzer.seed(0)
    }
    
    static seed (kernel) {
        mutater._random = new Random.Random(Random.MersenneTwister19937.seed(kernel));
        return mutater._random;
    }

    static str( str ) {
        return mutateStr(this, str);        
    }

};

async function mtfuzz(iterations, repoPath, testFn) {

    let codePath = repoPath + 'src/main/java/edu/ncsu/csc/iTrust2/';

    let result = await sshSync(`echo $(find ${codePath} -type f -name "*.java") > test_suite_analysis/.test-files-output`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    const unmutableFiles = new Set();
    const mutableFiles = new Set();

    let sourceFiles = fs.readFileSync('test_suite_analysis/.test-files-output').toString().split(' ');
    
    if (!sourceFiles) {
        console.log(chalk.red('No JAVA files!'));
        process.exit(1);
    }

    let len = sourceFiles.length;

    var failedTestRuns = 0;
    var compileFailed = 0;
    var total_tests = {};

    mutater.seed(0);

    console.log(chalk.green(`Fuzzing '${testFn}' with ${iterations} randomly generated-inputs.`));

    let failedTestCases = new Set();
    let passedTestCases = new Set();

    for (var i = 1; i <= iterations; i++) {

        failedTestCases = new Set();
        passedTestCases = new Set();

        let idx = mutater.random().integer(0, len - 1);

        let filePath = sourceFiles[ idx ];

        // increasing efficiency
        if (unmutableFiles.has(filePath)) {
            continue;
        }
        else if (!mutableFiles.has(filePath)) {
            let isMutable = isMutationPossible(filePath);
            if (isMutable) {
                mutableFiles.add(filePath);
            } else {
                unmutableFiles.add(filePath);
                continue;
            }
        }

        result = await sshSync(`cp ${filePath} /bakerx/test_suite_analysis/.test-file`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }
        result = await sshSync(`cp ${filePath} /bakerx/test_suite_analysis/.test-file-original`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        let originalString = fs.readFileSync('test_suite_analysis/.test-file','utf-8');
        let mutuatedString = mutater.str(originalString);
        
        if( !fs.existsSync('test_suite_analysis/.mutations') ) {
            fs.mkdirSync('test_suite_analysis/.mutations');
        }
        fs.writeFileSync(path.join( 'test_suite_analysis/.mutations', `${i}.txt`), mutuatedString);

        // replace the existing file with the mutated file
        // console.log("Replacing original with mutated.");
        result = await sshSync(`cp /bakerx/test_suite_analysis/.mutations/${i}.txt ${filePath}`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        // run given function under test with input
        // console.log("Testing function called!");
        testFn();

        // reset the mutated file
        // console.log("resetting the mutated file");
        result = await sshSync(`cp /bakerx/test_suite_analysis/.test-file-original ${filePath}`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        // drop the DB
        // console.log("Dropping the DB");
        result = await sshSync('chmod +x /bakerx/test_suite_analysis/drop-table.sh; bash /bakerx/test_suite_analysis/drop-table.sh', 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        // checking if the mutation results in compilation failure
        // console.log("checking if compile failure");
        let testOutput = fs.readFileSync('test_suite_analysis/.test-output','utf-8').toString();
        let compileFailRegex = /COMPILATION ERROR/;
        if (compileFailRegex.test(testOutput)) {
            i--;
            compileFailed++;
            continue;
        }
        
        result = await sshSync(`cd /bakerx/test_suite_analysis/; echo $(find iTrust2-v8/iTrust2/target/surefire-reports/ -type f -name "*.txt") > test_suite_analysis/.test-classnames`, 'vagrant@192.168.33.20');
        if( result.error ) { console.log(result.error); process.exit( result.status ); }

        let testReportPaths = fs.readFileSync('test_suite_analysis/.test-classnames').toString().split(' ');
        
        testReportPaths.forEach( (testReportFile) => {
            let testClassNameRegex = /(?<=reports\/).*(?=\.txt)/;
            let failCountRegex = /(?<=Failures: )[0-9]{1,2}/;

            let testClassName = testReportFile.match(testClassNameRegex)[0];

            let failedTestCaseRegex = new RegExp('(?<='+ testClassName +'\\.)..*(?=\\()');
            let passedTestCaseRegex = /(?<=<testcase name=")[a-zA-Z]+/;

            let testReport = fs.readFileSync('test_suite_analysis/' + testReportFile.replace(/\n/g, '')).toString();

            let failureCount = testReport.match(failCountRegex)[0];

            if (failureCount != 0) {
                let reportArray = testReport.split('\n');
                reportArray.forEach(line => {
                    if (failedTestCaseRegex.test(line)) {
                        let testCase = testClassName + "." + line.match(failedTestCaseRegex)[0];
                        failedTestCases.add(testCase);
                    }
                });
            }

            let xmlReportPath = 'test_suite_analysis/iTrust2-v8/iTrust2/target/surefire-reports/TEST-' + testClassName + '.xml';
            let xmlReportArray = fs.readFileSync(xmlReportPath).toString().split('\n');
            xmlReportArray.forEach(line => {
                if (passedTestCaseRegex.test(line)) {
                    let testCase = testClassName + "." + line.match(passedTestCaseRegex)[0];
                    if (!failedTestCases.has(testCase)) {
                        passedTestCases.add(testCase);
                    }
                }
            });
        });

        // for mutation coverage
        if (failedTestCases.size !== 0) {
            failedTestRuns++;
        }

        passedTestCases.forEach((testCase) => {
            if (!total_tests[testCase]) {
                total_tests[testCase] = {failedCount: 0, passedCount: 1};
            } else {
                total_tests[testCase]['passedCount'] += 1;
            }
        });

        failedTestCases.forEach((testCase) => {
            if (!total_tests[testCase]) {
                total_tests[testCase] = {failedCount: 1, passedCount: 0};
            } else {
                total_tests[testCase]['failedCount'] += 1;
            }
        });
        
        console.log("Iteration: ", i);
    }

    console.log(unmutableFiles);
    console.log(total_tests);
    console.log(chalk.red("Compile failed Iterations: ", compileFailed));
    
    // Total OUTPUT!
    let mutation_coverage = Math.round(failedTestRuns/parseFloat(iterations) * 100);
    console.log(`\nOverall mutation coverage: ${failedTestRuns * 5}/${iterations * 5} (${mutation_coverage}%) mutations caught by the test suite.`);

    console.log('Useful tests\n============\n');

    Object.keys(total_tests)
      .sort( (a, b) => {
        if (total_tests[a]['failedCount'] != total_tests[b]['failedCount']) {
            return (total_tests[b]['failedCount'] - total_tests[a]['failedCount']);
        }
      })
      .forEach(e => {
        let coverage = Math.round(total_tests[e]['failedCount']/parseFloat(iterations) * 100);
        console.log(`${coverage}/100 ${e}\n`);
      });
}

exports.mtfuzz = mtfuzz;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

async function isMutationPossible(filePath) {

    let result = await sshSync(`cp ${filePath} /bakerx/test_suite_analysis/.is-mutable`, 'vagrant@192.168.33.20');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    let file_arr = fs.readFileSync('test_suite_analysis/.is-mutable','utf-8').toString().split('\n');
    let regex = new RegExp('String.+=.+".+"');
    let other_list = ['0', '<', '+', 'Public', '=='];

    file_arr.forEach(fileLine => {
        if (regex.test(fileLine)) {
            return true;
        }
        for (let i = 0; i < other_list.length; i++) {
            if (fileLine.includes(other_list[i])) {
                return true;
            }
        }
    });
    
    return false;
}