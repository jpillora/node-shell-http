


var cp = require("child_process");

var through = require("through");
var stderr = through();
var stdout = through();
var stdin = through();

setTimeout(function() {
  stdin.emit('data','date\n');
}, 1000);
setTimeout(function() {
  stdin.emit('data','date\n');
}, 1500);
setTimeout(function() {
  stdin.emit('end');
}, 2000);

stdout.on('data', function(buff) {
  process.stdout.write(">>> " + buff);
});

var proc = cp.spawn("/bin/sh", []);

proc.on("error", function(err) {
  console.log(":O :O error",err);
});

stdin.pipe(proc.stdin);
proc.stdout.pipe(stdout);
proc.stderr.pipe(stderr);


