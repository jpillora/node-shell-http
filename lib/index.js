
if(process.env.SHELL_HTTP_TOKEN)
  process.env.PNODE_HTTP_TOKEN = process.env.SHELL_HTTP_TOKEN;

var pnode = require('pnode');
var os = require("os");
var http = require("http");
var https = require("https");
var cp = require("child_process");
var through = require("through");
var EventEmitter = require("events").EventEmitter;

exports.create = function() {
  var s = http.createServer(function(req, res) {
    res.end(':O');
  });
  s.listen.apply(s, arguments);
  return exports.install(s);
};

exports.install = function(httpServer, filter) {

  if(httpServer instanceof http.Server)
    type = 'http';
  else if(httpServer instanceof https.Server)
    type = 'https';
  else
    throw new Error("Invalid http server object");

  var ee = new EventEmitter();
  ee.close = function(cb) {
    server.unbind(cb);
  };

  var server = pnode.server({ debug:false });

  server.on('connection', function(conn) {
    conn.once('up', function() {
      ee.emit('connection', conn.id, conn.ctx.ip, conn.ctx.port);
    });
  });
  server.on('disconnection', function(conn) {
    ee.emit('disconnection', conn.id, conn.ctx.ip, conn.ctx.port);
  });

  var proc;
  function start() {
    //cleanup
    if(proc) {
      ee.stdin.removeAllListeners();
      ee.stdout.removeAllListeners();
      ee.stderr.removeAllListeners();
    }
    ee.stdin = through();
    ee.stdout = through();
    ee.stderr = through();
    //stdout
    ee.stdout.on('data', function(data) {
      server.publish('stdout', data.toString());
    });
    //stderr
    ee.stderr.on('data', function(data) {
      server.publish('stderr', data.toString());
    });
    //spawn shell
    proc = cp.spawn("/bin/sh", []);
    ee.stdin.pipe(proc.stdin);
    proc.stdout.pipe(ee.stdout);
    proc.stderr.pipe(ee.stderr);
    //infinite lives :)
    proc.on('exit', start);
  }
  start();

  //stdin
  server.expose({
    //provide current server info
    info: [function() {
      var info = {};
      [ "tmpdir", "endianness", "hostname", "type", "platform", "cpus",
        "arch", "release", "uptime", "loadavg", "totalmem", "freemem",
        "networkInterfaces" ].forEach(function(fn) {
        info[fn] = os[fn]();
      });
      info.date = new Date().toISOString();
      return info;
    }],
    //expose a stdin write method
    write: function(data) {
      ee.emit('write', data);
      ee.stdin.write(data.toString());
    },
    //restarts the shell process
    restart: function() {
      console.log("Restarting shell...".grey);
      proc.kill();
    }
  });

  server.bind(type, httpServer, filter);

  return ee;
};

exports.connect = function() {

  var ee = new EventEmitter();
  ee.stdin = through();
  ee.stdout = through();
  ee.stderr = through();
  ee.restart = function() {
    client.server(function(remote) {
      remote.restart();
    });
  };
  ee.close = function(cb) {
    client.unbind(cb);
  };

  //setup pnode client
  var client = pnode.client({
    debug:false,
    retryInterval: 1000,
    maxRetries: 10
  });

  client.bind.apply(client, [].slice.call(arguments));

  client.on('remote', function(remote) {
    ee.info = remote.info;
    ee.emit('connected');
  });
  client.on('unbound', function() {
    ee.emit('disconnected');
  });

  //proxy to and from streams
  ee.stdin.on('data', function(data) {
    client.server(function(remote) {
      remote.write(data.toString());
    });
  });
  client.subscribe('stdout', function(data) {
    ee.stdout.write(data.toString());
  });
  client.subscribe('stderr', function(data) {
    ee.stderr.write(data.toString());
  });

  return ee;
};