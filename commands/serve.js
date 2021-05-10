const chalk = require('chalk');
const path = require('path');
const os = require('os');
const child = require('child_process');
const fs = require('fs');

const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');
const sshSync = require('../lib/ssh');

exports.command = 'serve';
exports.desc = 'Run traffic proxy.';
exports.builder = yargs => {};

exports.handler = async argv => {
    const { } = argv;

    (async () => {

        await run( );

    })();

};
let result;
const BLUE  = 'http://192.168.44.25:3000/preview';
const GREEN = 'http://192.168.44.30:3000/preview';

class Production
{
    constructor()
    {
        this.TARGET = BLUE;
        setTimeout( this.failover.bind(this), 66000 );
        var metricInterval = setInterval(async function() {
            result = await sshSync(`chmod +x metric-blue.sh`, 'vagrant@192.168.44.25'); //BLUE
            if( result.error ) { console.log(result.error); process.exit( result.status ); }
            result = await sshSync(`chmod +x metric-green.sh`, 'vagrant@192.168.44.30'); //GREEN
            if( result.error ) { console.log(result.error); process.exit( result.status ); }
            result = await sshSync(`./metric-blue.sh`, 'vagrant@192.168.44.25'); //BLUE
            if( result.error ) { console.log(result.error); process.exit( result.status ); }
            result = await sshSync(`./metric-green.sh`, 'vagrant@192.168.44.30'); //GREEN
            if( result.error ) { console.log(result.error); process.exit( result.status ); }
        }, 10000);
        setTimeout(function(){
            clearInterval(metricInterval);
        }, 180000);
    }

    // TASK 1: 
    proxy()
    {
        let options = {};
        let proxy   = httpProxy.createProxyServer(options);
        let self = this;
        // Redirect requests to the active TARGET (BLUE or GREEN)
        let server  = http.createServer(function(req, res)
        {
            // callback for redirecting requests.
            proxy.web( req, res, {target: self.TARGET } );
        });
        server.listen(3090);
   }

   failover()
   {
      //console.log("Switched server");
      this.TARGET = GREEN;  
   }

   async healthCheck()
   {
      try 
      {
         const response = await got(this.TARGET, {throwHttpErrors: false});
         let status = response.statusCode == 200 ? chalk.green(response.statusCode) : chalk.red(response.statusCode);
         console.log( chalk`{grey Health check on ${this.TARGET}}: ${status}`);
         if(response.statusCode != 200){
            //this.failover();
         }
      }
      catch (error) {
         console.log(error);
      }
   }
   
}

async function run() {
    console.log(chalk.keyword('pink')('Starting proxy on localhost:3090'));
    let result;
    let prod = new Production();
    prod.proxy();
    //process.exit(0);
}
