// websocket server that dashboard connects to.
const redis = require('redis');
const got = require('got');
const fs = require('fs');
const path = require('path');

// We need your host computer ip address in order to use port forwards to servers.
// let checkbox_ip = getIpAddress('checkbox_ip.txt');
// let iTrust_ip = getIpAddress('iTrust_ip.txt');
// let monitor_ip = getIpAddress('monitor_ip.txt');
let checkbox_ip = process.env.CHECKBOX_IP;
let iTrust_ip = process.env.ITRUST_IP;

// function getIpAddress(textFile) {
// 	try {
// 		return(fs.readFileSync(path.join(__dirname, textFile)).toString());
	
// 	}
// 	catch(e) {
// 		console.log(e);
// 		throw new Error(`Missing required ${textFile} file`);	
// 	}
// }

/// Servers data being monitored.
var servers = [
	//CHANGE THE URLs ACCORDING TO THE DECIDED ENDPOINTS
	{name: "checkbox", url:`http://${checkbox_ip}/`, status: "#cccccc",  scoreTrend : [0]},
	{name: "itrust", url:`http://${iTrust_ip}:8080/iTrust2/`, status: "#cccccc",  scoreTrend : [0]},
];


function start(app) {
	////////////////////////////////////////////////////////////////////////////////////////
	// DASHBOARD
	////////////////////////////////////////////////////////////////////////////////////////
	const io = require('socket.io')(3000);
	// Force websocket protocol, otherwise some browsers may try polling.
	io.set('transports', ['websocket']);
	// Whenever a new page/client opens a dashboard, we handle the request for the new socket.
	io.on('connection', function (socket) {
        console.log(`Received connection id ${socket.id} connected ${socket.connected}`);

		if( socket.connected ) {
			//// Broadcast heartbeat event over websockets ever 1 second
			var heartbeatTimer = setInterval( function () {
				socket.emit("heartbeat", servers);
			}, 1000);

			//// If a client disconnects, we will stop sending events for them.
			socket.on('disconnect', function (reason) {
				console.log(`closing connection ${reason}`);
				clearInterval(heartbeatTimer);
			});
		}
	});

	/////////////////////////////////////////////////////////////////////////////////////////
	// REDIS SUBSCRIPTION
	/////////////////////////////////////////////////////////////////////////////////////////
	let client = redis.createClient(6379, 'localhost', {});
	// We subscribe to all the data being published by the server's metric agent.
	for( var server of servers ) {
		// The name of the server is the name of the channel to recent published events on redis.
		client.subscribe(server.name);
		console.log('Subscribing to the server: ', server.name, server.url);
	}

	// When an agent has published information to a channel, we will receive notification here.
	client.on("message", function (channel, message) {
		console.log(`Received message from agent: ${channel}`)
		for( var server of servers ) {
			// Update our current snapshot for a server's metrics.
			if( server.name == channel) {
				let payload = JSON.parse(message);
				server.memoryLoad = Math.round(payload.memoryLoad * 100) / 100;
				server.cpu = Math.round(payload.cpu * 100) / 100;
				updateHealth(server);
			}
		}
	});

	// LATENCY CHECK
	var latency = setInterval( function () {
		for( var server of servers ) {
			if( server.url ) {
				let now = Date.now();

				// Bind a new variable in order to for it to be properly captured inside closure.
				let captureServer = server;

				// Make request to server we are monitoring.
				got(server.url, {timeout: 5000, throwHttpErrors: false}).then(function(res) {
					captureServer.statusCode = res.statusCode;
					captureServer.latency = Date.now() - now;
				}).catch( e => {
					captureServer.statusCode = e.code;
					captureServer.latency = 5000;
				});
			}
		}
	}, 10000);
}

// TASK 3
function updateHealth(server) {
	let score = 0;
	
	// Update score calculation.
	if(server.statusCode == 200) {
		score++;
	}

	if(server.memoryLoad <= 50) {
		score++;
	}

	if(server.cpu <= 50 ) {
		score++;
	}

	if(server.latency <= 30 ) {
		score++;
	}

	server.status = score2color(score/4);

	console.log(`Score: ${server.name} ${score}`);

	// Add score to trend data.
	server.scoreTrend.push((4 - score));
	if( server.scoreTrend.length > 100 ) {
		server.scoreTrend.shift();
	}
}

function score2color(score) {
	if (score <= 0.25) return "#ff0000";
	if (score <= 0.50) return "#ffcc00";
	if (score <= 0.75) return "#00cc00";
	return "#00ff00";
}

module.exports.start = start;