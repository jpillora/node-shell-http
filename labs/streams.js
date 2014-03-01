var R = require('readable-stream');
var util = require('util');
var EE = require('events').EventEmitter;

function TestReader() {
  R.apply(this);
  this._sent = false;
}

util.inherits(TestReader, R);

TestReader.prototype._read = function() {
  console.log("read!")
  if(this._sent) {
    this.push(null);
  } else {
    this.push('date\n');
    this._sent = true;
  }
};

/////

function TestWriter() {
  EE.apply(this);
  this.received = [];
  this.flush = false;
}

util.inherits(TestWriter, EE);

TestWriter.prototype.write = function(c) {
  console.log("write! " + c)
  this.received.push(c.toString());
  this.emit('write', c);
  return true;
};

TestWriter.prototype.end = function(c) {
  if (c) this.write(c);
  this.emit('end', this.received);
};

////////