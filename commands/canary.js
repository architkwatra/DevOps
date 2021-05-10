const child = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const {execSync} = require('child_process');
const fs = require('fs');

const sshSync = require('../lib/ssh');
const mannwhitneyu = require('../lib/mannwhitneyu');

exports.command = 'canary <blueBranch> <greenBranch>';
exports.desc = 'Construct canary infrastructure, collect data, and perform analysis on the given branches.';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { blueBranch, greenBranch } = argv;

    (async () => {

        await run( blueBranch, greenBranch );

    })();

};

const BLUE  = 'http://192.168.44.25:3000';
const GREEN = 'http://192.168.44.30:3000';

async function run(blueBranch, greenBranch) {

    let result;
    try {
      // lsof -i tcp:3090
      result = child.spawnSync("kill -9 $(lsof -t -i:3090) || true", {shell:true, stdio: 'inherit'} );
      if( result.error ) { console.log(result.error); process.exit( result.status ); }
      
    } catch {
      console.log(chalk.red("HERE"));
    };
    
    console.log(chalk.greenBright('Constructing a computing environment...'));

    result = await child.spawnSync("bakerx run", {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
  
    result = child.spawnSync("chmod +x cm/preview-setup.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/preview-setup.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("chmod +x cm/metric-blue.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/metric-blue.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("chmod +x cm/metric-green.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/metric-green.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("chmod +x cm/siege.sh", {shell:true, stdio: 'inherit'});
    result = child.spawnSync("sed -i -e \'s\/\\r\$\/\\n\/\' cm/siege.sh", {shell:true, stdio: 'inherit'});
    result = await sshSync('/bakerx/cm/preview-setup.sh '+blueBranch, 'vagrant@192.168.44.25'); //BLUE
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync('/bakerx/cm/preview-setup.sh '+greenBranch, 'vagrant@192.168.44.30'); //GREEN
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync("rm cpu-blue.txt", 'vagrant@192.168.44.25'); //BLUE
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync("rm cpu-green.txt", 'vagrant@192.168.44.30'); //GREEN
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync("rm mem-blue.txt", 'vagrant@192.168.44.25'); //BLUE
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync("rm mem-green.txt", 'vagrant@192.168.44.30'); //GREEN
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key cm/metric-blue.sh vagrant@192.168.44.25:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key cm/metric-blue.sh vagrant@192.168.44.25:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key cm/metric-green.sh vagrant@192.168.44.30:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key cm/metric-green.sh vagrant@192.168.44.30:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("scp -o 'StrictHostKeyChecking=no' -o 'UserKnownHostsFile=/dev/null' -i ~/.bakerx/insecure_private_key cm/siege.sh vagrant@192.168.44.31:~/", {shell:true, stdio: 'inherit'});
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    console.log(chalk.greenBright('Environment has been setup'));
    
    const waitFor2 = delay => new Promise(resolve => setTimeout(resolve, delay));
    await waitFor2(5000);
  
    //run proxy server
    let ip = getIPAddress();
    result = child.spawn("node index.js serve &", {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
    await waitFor(11000);
    result = sshSync(`./siege.sh ${ip} blue`, 'vagrant@192.168.44.31');    

    result = await sshSync('cp cpu-blue.txt /bakerx', 'vagrant@192.168.44.25');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    result = await sshSync('cp mem-blue.txt /bakerx', 'vagrant@192.168.44.25');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    const waitFors = delay => new Promise(resolve => setTimeout(resolve, delay));
    await waitFors(63000);
    result = sshSync(`./siege.sh ${ip} green`, 'vagrant@192.168.44.31');  
    //console.log(chalk.greenBright('Canary Report:\n'));

    result = await sshSync('cp cpu-green.txt /bakerx', 'vagrant@192.168.44.30');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    result = await sshSync('cp mem-green.txt /bakerx', 'vagrant@192.168.44.30');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    
    result = await sshSync('mv load-test-blue.txt /bakerx', 'vagrant@192.168.44.31');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = await sshSync('mv load-test-green.txt /bakerx', 'vagrant@192.168.44.31');
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    
    var cpu_blue = [], cpu_green = [], mem_blue = [], mem_green = [];
    cpu_blue = fs
      .readFileSync("./cpu-blue.txt")
      .toString('UTF8')
      .split('\n');
    mem_blue = fs
      .readFileSync("./mem-blue.txt")
      .toString('UTF8')
      .split('\n');
    cpu_blue.splice(-1,1)
    mem_blue.splice(-1,1)
    let cpu_blue_1 = cpu_blue.slice(-6)
    let mem_blue_1 = mem_blue.slice(-6)
    let cpu_b = cpu_blue_1.map(num=>100-parseInt(num));
    let mem_b = mem_blue_1.map(num=>parseInt(num));
    //console.log(cpu_b,mem_b)

    cpu_green = fs
      .readFileSync("./cpu-green.txt")
      .toString('UTF8')
      .split('\n');
    mem_green = fs
      .readFileSync("./mem-green.txt")
      .toString('UTF8')
      .split('\n');
    cpu_green.splice(-1,1);
    mem_green.splice(-1,1);
    let cpu_green_1 = cpu_green.slice(-6)
    let mem_green_1 = mem_green.slice(-6)
    let cpu_g = cpu_green_1.map(num=>100-parseInt(num));
    let mem_g = mem_green_1.map(num=>parseInt(num));
    //console.log(cpu_g,mem_g)

    //CPU Test
    var cpu_t = mannwhitneyu.test(cpu_b, cpu_g, alternative = 'less');
    console.log("\n\n\nMann Whitney Test: \n\n CPU Metric \nP value:"+cpu_t.p);
    console.log("\nU value:"+cpu_t.U);
    //Memory Test
    var mem_t = mannwhitneyu.test(mem_b, mem_g, alternative = 'less');
    console.log("\n\n Memory Metric \nP value:"+mem_t.p);
    console.log("\nU value:"+mem_t.U);


    var xi = [], yi = [];

    result = child.spawnSync("tail -n +3 load-test-blue.txt | grep -Eo '[+-]?[0-9]+([.][0-9]+)?' > blue.txt", {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }
    result = child.spawnSync("tail -n +3 load-test-green.txt | grep -Eo '[+-]?[0-9]+([.][0-9]+)?' > green.txt", {shell:true, stdio: 'inherit'} );
    if( result.error ) { console.log(result.error); process.exit( result.status ); }

    xi = fs
      .readFileSync("green.txt")
      .toString('UTF8')
      .split('\n');
    yi = fs
    .readFileSync("blue.txt")
    .toString('UTF8')
    .split('\n');
    xi.splice(-1,1)
    yi.splice(-1,1)
    let x = xi.map(num=>parseFloat(num))
    let y = yi.map(num=>parseFloat(num))
    //console.log(x,y)
    if(x.length == 15){
      x.shift();
      x.shift();
      x.shift();
    }
    if(y.length == 15){
      y.shift();
      y.shift();
      y.shift();
    }
    var t = mannwhitneyu.test(x, y, alternative = 'less');
    console.log("\n\n Other Metrics \nP value:"+t.p);
    console.log("\nU value:"+t.U);
    const cpu_g_avg = cpu_g.reduce((a, b) => (a + b)) / cpu_g.length;
    const mem_g_avg = mem_g.reduce((a, b) => (a + b)) / mem_g.length;
    const cpu_b_avg = cpu_b.reduce((a, b) => (a + b)) / cpu_b.length;
    const mem_b_avg = mem_b.reduce((a, b) => (a + b)) / mem_b.length;
    console.log("\n\n******Canary Report******\n\n"+blueBranch+':\n');
    console.log("Transactions:"+y[0]+" hits\nAvailability:"+y[1]+"%\nData transferred:"+y[3]+"\nThroughput:"+y[6]+" MB/sec\nConcurrency:"+y[7]
    +"\nSuccessful transactions:"+y[8]+"\nFailed transactions:"+y[9]+"\nLongest transaction:"+y[10]+"\nShortest transaction:"+y[11]+"\nMemory:"+mem_b_avg.toFixed(2)+"%\nCPU:"+cpu_b_avg.toFixed(2)+"%\nLatency:"+y[4]+" secs");

    console.log("\n\n"+greenBranch+':\n');
    console.log("Transactions:"+x[0]+" hits\nAvailability:"+x[1]+"%\nData transferred:"+x[3]+"\nThroughput:"+x[6]+" MB/sec\nConcurrency:"+x[7]
    +"\nSuccessful transactions:"+x[8]+"\nFailed transactions:"+x[9]+"\nLongest transaction:"+x[10]+"\nShortest transaction:"+x[11]+"\nMemory:"+mem_g_avg.toFixed(2)+"%\nCPU:"+cpu_g_avg.toFixed(2)+"%\nLatency:"+x[4]+" secs");

    let canaryscore = 0;
    if(x[8] != 0) //Failed Transactions
      canaryscore = canaryscore + 1
    if(x[4] > 0.0 && x[4] < 5) //Latency
      canaryscore = canaryscore + 1
    if(x[7] != 0.00) //Concurrency
      canaryscore = canaryscore + 1
    if(cpu_g_avg < 85) //CPU
      canaryscore = canaryscore + 1
    if(mem_g_avg < 85) //Memory
      canaryscore = canaryscore + 1
    if(t.p>=0.15 && t.p < 0.85 ) //Metrics
      canaryscore = canaryscore + 1


    if(x.length < 25 && y.length < 25){
      console.log(chalk.yellowBright("\nCanary Score: "+canaryscore+" out of 6"));
      if(t.p<0.15 || t.p > 0.85 || canaryscore<4) //0.15 significance
        console.log(chalk.redBright("\nCanary Failed\n"))
      else
        console.log(chalk.greenBright("\nCanary Passed\n"))
    }
    else{
      console.log("\nServer error..")
    }
    console.log(chalk.blueBright("Canary Analysis Completed"))
    await fs.unlinkSync('load-test-blue.txt');
    await fs.unlinkSync('load-test-green.txt');
    await fs.unlinkSync('blue.txt');
    await fs.unlinkSync('green.txt');
    await fs.unlinkSync('mem-blue.txt');
    await fs.unlinkSync('mem-green.txt');
    await fs.unlinkSync('cpu-blue.txt');
    await fs.unlinkSync('cpu-green.txt');
    //process.exit(1);
    
}



function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
      var iface = interfaces[devName];
  
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
          return alias.address;
      }
    }
  
    return '0.0.0.0';
  }
