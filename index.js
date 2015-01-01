var process = require('child_process');
var Promise = require('bluebird');
var type = require('typelib');

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
				console.log(' start: ' + the_command);
			}
			else if (conf.verbose) {
				console.log(' ' + the_command);
			}

			var instructions = the_command.split(' ');
			var command = instructions.shift();

			var instance = process.spawn(command, instructions);

			instance.stdout.on('data', function (output) {
				console.log(output);
			});

			instance.stderr.on('data', function (err) {
				console.log(err);
			});

			instance.on('close', function (code) {
				if (conf.tracking) {
					console.log('   end: ' + the_command);
				}

				if (code == 0) {
					resolve();
				}
				else { // code != 0
					reject(new Error('Command ' + command + ' exited with code: ' + code))
				}
			});

			instance.on('error', function (err) {
				console.log(' Failed calling ' + command + '; potentially unrecognized by system');
			})
		});
	};

	cmd.fin = function (cb) {
		return function () {
			cb(null);
			console.log("\n");
		};
	};

	return cmd;
}

// export bluebird promise implementation in use
cmdspawn.Promise = Promise;

module.exports = cmdspawn;