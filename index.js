var child_process = require('child_process');
var Promise = require('lie');
var type = require('typelib');
var c = require('chalk');

var defaults = {
	tracking : false, // show start and end of command
	verbose  : true   // write executed commands to console
};

var cmdspawn = function (conf) {
	var conf = type.merge({}, defaults, conf);
	var cmd = function (the_command) {
		var args = Array.prototype.slice.call(arguments);
		if (args.length > 1) {
			the_command = args.join(' ');
		}
		else if (the_command instanceof Array) {
			the_command = the_command.join(' ');
		}

		return new Promise(function (resolve, reject) {

			if (conf.tracking) {
				console.log(c.blue('start') + ' ' + the_command);
			}
			else if (conf.verbose) {
				console.log(' ' + the_command);
			}

			var instructions = the_command.split(' ');
			var command = instructions.shift();

			var instance = child_process.spawn(command, instructions);

			instance.stdout.on('data', function (output) {
				process.stdout.write(output.toString());
			});

			instance.stderr.on('data', function (err) {
				process.stderr.write(err.toString());
			});

			instance.on('close', function (code) {
				if (conf.tracking) {
					console.log('  ' + c.blue('end') + ' ' + the_command);
				}

				if (code == 0) {
					resolve();
				}
				else { // code != 0
					reject(new Error('command ' + command + ' exited with code ' + code));
				}
			});

			instance.on('error', function (err) {
				console.log('failed calling ' + command + '; potentially unrecognized by system');
				reject(err);
			})
		});
	};

	cmd.fin = function (cb) {
		return function () {
			cb(null);
			console.log("\n");
		};
	};

	cmd.noop = function () {};

	// promise error reporting
	cmd.err = function (reason) {
		if (reason) {
			if (reason.stack) {
				console.log('');
				console.log(c.red.dim('error detected'));
				console.log(reason.stack);
			}
			else { // no error stack
				console.log('');
				console.log(c.red.dim(reason))
			}
		}

		return Promise.reject();
	};

	// no error messages for error
	cmd.silent = function (reason) {
		return Promise.reject();
	};

	// functor to be used in promise chaining
	cmd.f = function (command) {
		return function () {
			return cmd(command);
		};
	};

	return cmd;
}

// export dependencies
cmdspawn.lib = {
	Promise: Promise
}

module.exports = cmdspawn;