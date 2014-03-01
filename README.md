# <name>shell-http</end>

## Summary

<description>Shell access over HTTP</end>

Install a [pnode](https://github.com/jpillora/pnode) RPC server over your HTTP servers
to provide shell access via Node's `child_process`.

## Usage

### Install `shell-http` on your server

```
npm install --save shell-http
```
``` js
var http = require("http");

//create server
var server = http.createServer(function(req, res) {
  res.end('a normal http server...');
}).listen(3000, function() {
  console.log("listening on http://localhost:3000");
});

//install shell daemon
var sh = require("shell-http");
sh.install(server);
```

### Connect with the `shell-http` API

```js
var sh = require("shell-http");
//create client
var client = sh.connect('http://localhost:3000');

//use 'client.std[in|out|err]'
setTimeout(function() {
  client.stdin.write("date\n");
}, 100);

client.stdout.on('data', function(data) {
  process.stdout.write("the date is: "+data);
});
```

### Connect with the [shell-http](http://github.com/jpillora/shell-http) CLI

```
npm install -g shell-http
```

### Live demo running on Heroku:

```
shell-http --token foobar shell-http-demo.herokuapp.com
```
```
Using token "foobar"
Connecting to http://shell-http-demo.herokuapp.com:80...
  Connected to '6c11425f-1d0d-4dca-89d3-0d3aee003867' (http://shell-http-demo.herokuapp.com:80)
  Server Time '2014-03-01T09:57:26.501Z' (Uptime 11077822.03734204sec)
  Memory Usage 4.342GB/35.968GB (12.07% free)
  Average CPU Loads [3.3427734375,3.77587890625,3.6591796875] (4.0 max)
$ date
> Sat Mar  1 09:57:34 UTC 2014
```

## Security Considerations

This project was created for fun and is not production ready. If you are
intent on using it however, I strongly advise you run it over an HTTPS server
with the access token (`SHELL_HTTP_TOKEN` env var) set to a cryptographically
strong passphrase.

## API

**Todo**

<license()>
#### MIT License

Copyright &copy; 2014 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</end>
