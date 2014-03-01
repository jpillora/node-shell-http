var http = require("http");

//create server
var server = http.createServer(function(req, res) {
  res.end('a normal http server...');
}).listen(3000, function() {
  console.log("listening on http://localhost:3000");
});

//install shell listener
var sh = require("../");
sh.install(server);

//create client
var client = sh.connect('http://localhost:3000');

//use 'client.std[in|out|err]'
client.on('connected', function() {
  client.stdin.write("date\n");
});

client.stdout.on('data', function(data) {
  process.stdout.write("the date is: "+data);
});