var path = require( "path" ),
	_ = require( "underscore" ),
	dist = "dist" + path.sep;

module.exports = function( grunt ) {
	return {
		js: {
			options: {
				baseUrl: "js",

				optimize: "none",

				//Finds require() dependencies inside a require() or define call.
				findNestedDependencies: true,

				//If skipModuleInsertion is false, then files that do not use define()
				//to define modules will get a define() placeholder inserted for them.
				//Also, require.pause/resume calls will be inserted.
				//Set it to true to avoid this. This is useful if you are building code that
				//does not use require() in the built project or in the JS files, but you
				//still want to use the optimization tool from RequireJS to concatenate
				//modules together.
				skipModuleInsertion: true,

				mainConfigFile: "js/requirejs.config.js",

				include: ( grunt.option( "modules" ) ?
					makeModulesList( grunt.option( "modules" ) ) :
					[ "jquery.mobile" ] ),

				exclude: [
					"jquery",
					"json",
					"json!../package.json"
				],

				out: path.join( "<%= dist %>", "<%= name %>" ) + "<%= versionSuffix %>.js",

				pragmasOnSave: {
					jqmBuildExclude: true
				},

				//File paths are relative to the build file, or if running a commmand
				//line build, the current directory.
				wrap: {
					startFile: "build/wrap.start",
					endFile: "build/wrap.end"
				},

				onBuildWrite: function (moduleName, path, contents) {
					return contents.replace(/__version__/g, grunt.config.process(
						"\"<%= version %>\""
					));
				}
			}
		}
	}
};