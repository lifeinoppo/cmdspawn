**cmdspawn** is an easy to use terminal command executor that spawns a command in the
background and returns a Promise to it; bluebird is used as the promise library.

```js
npm install cmdspawn
```
Using a `package.json` to manage dependencies?

 - `npm i -D cmdspawn` to install
 - `npm rm -D cmdspawn` to uninstall

**USAGE**

Running `cmdspawn` gives you a function that can execute commands, using the given
configuration you provided to `cmdspawn`. The executor instance you are given accepts
anything from arrays, variable parameters or just a plain string. In all cases the input is converted to a string (joined with spaces if necesary) and executed.

The bluebird Promise library in use is available via the `cmdspawn.Promise`. See:
[Bluebird API](https://github.com/petkaantonov/bluebird/blob/master/API.md) for helper
functions. If you just care for basic methods like `then` you don't really need to worry
about that.

Sometimes a callback function is required. To keep code nice and clean you can use the 
functor `.fin` on the instance and pass it the cb parameter, a function that calls the
callback and echo'es a empty line on the console will be created for you. See advanced example for use case.

### Minimal Example

```js
var cmdspawn = require('cmdspawn');

var cmd = cmdspawn({
	tracking : false, // show start and end of command
	verbose  : true   // write executed commands to console
});

// the following are all equivalent
// use whatever is easier in your code

cmd('ls -la');
cmd('ls', '-la');
cmd(['ls', '-la']);
```

Should probably be noted that all the above execute in parallel. They will not block,
you'll have to use the promise object they return if you want to sync them.

### Advance Example: A Basic Gulp C++ Compiler

```sh
mkdir build
mkdir src
touch src/main.cc
```
```cpp
#include <iostream>

using namespace std;

int main () {
	auto msg = "hello, world";
	cout << msg << endl;
	return 0;
}
```
```
echo "{}" > package.json
sudo npm i -g gulp@3
npm i -D gulp@3
npm i -D cmdspawn@1
touch gulpfile.js
```
```js
var gulp     = require('gulp');
var cmdspawn = require('cmdspawn');
// ----------------------------------------------------------------------------

var cmd = cmdspawn({
	tracking : false, 
	verbose  : true
});

var Compiler = 'g++ -std=c++11';

var compile = function (src, dest) {
	return cmd(Compiler, '-o', dest, '-c', src);
};

var link = function (files, dest) {
	return cmd(Compiler, '-o', dest, files.join(' '));
};

gulp.task('default', function (cb) {
	compile('src/main.cc', 'build/main.o')
		.then(function () {
			link(['build/main.o'], 'build/app')
				.then(cmd.fin(cb))
		});
});

```

There's always the posibility when dealing with promises that you don't quite
call things in the right order or don't sync them, if you encounter cases where
that appears to happen simply enable `tracking` and you'll clearly see what's not 
syncing up.
