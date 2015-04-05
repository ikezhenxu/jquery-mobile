module.exports = function( grunt ) {
	"use strict";

	var _ = require( "underscore" ),

		replaceCombinedCssReference = function( href, processedName ) {
			return href
				.replace( /^css/, "demos/css")
				.replace( /\.\.\/css/, "css" )
				.replace( /jquery\.mobile\.css/, processedName + ".min.css" );
		},

		// Ensure that modules specified via the --modules option are in the same
		// order as the one in which they appear in js/jquery.mobile.js. To achieve
		// this, we parse js/jquery.mobile.js and reconstruct the array of
		// dependencies listed therein.
		makeModulesList = function( modules ) {
			var start, end, index,
				modulesHash = {},
				fixedModules = [],
				jsFile = grunt.file.read( path.join( "js", "jquery.mobile.js" ) );

			modules = modules.split( "," );

			// This is highly dependent on the contents of js/jquery.mobile.js
			if ( jsFile ) {
				start = jsFile.indexOf( "[" );
				if ( start > -1 ) {
					start++;
					end = jsFile.indexOf( "]" );
					if ( start < jsFile.length &&
						end > -1 && end < jsFile.length && end > start ) {

						// Convert list of desired modules to a hash
						for ( index = 0 ; index < modules.length ; index++ ) {
							modulesHash[ modules[ index ] ] = true;
						}

						// Split list of modules from js/jquery.mobile.js into an array
						jsFile = jsFile
							.slice( start, end )
							.match( /"[^"]*"/gm );

						// Add each desired module to the fixed list of modules in the
						// correct order
						for ( index = 0 ; index < jsFile.length ; index++ ) {

							// First we need to touch up each module from js/jquery.mobile.js
							jsFile[ index ] = jsFile[ index ]
								.replace( /"/g, "" )
								.replace( /^.\//, "" );

							// Then, if it's in the hash of desired modules, add it to the
							// list containing the desired modules in the correct order
							if ( modulesHash[ jsFile[ index ] ] ) {
								fixedModules.push( jsFile[ index ] );
							}
						}

						// If we've found all the desired modules, we re-create the comma-
						// separated list and return it.
						if ( fixedModules.length === modules.length ) {
							modules = fixedModules;
						}
					}
				}
			}

			return modules;
		},
		path = require( "path" ),
		dist = "dist" + path.sep,
		copyrightYear = grunt.template.today( "UTC:yyyy" ),
		dirs = {
			dist: dist,
			cdn: {
				google: path.join( dist, "cdn-google" ),
				jquery: path.join( dist, "cdn" ),
				git: path.join( dist, "git" )
			},
			tmp: path.join( dist, "tmp" )
		};

	var path = require( "path" );
	var pkg = grunt.file.readJSON( "package.json" );

	require( "load-grunt-config" )( grunt, {
		configPath: [
			path.join( process.cwd(), "build/tasks/options" ),
			path.join( process.cwd(), "build/tasks" )
		],
		init: true,
		data: {
			dist: dist,
			name: "jquery.mobile",
			phpPort: Math.floor( 8000 + Math.random()*1000 ),
			versionSuffix: "",
			headHash: "",
			headShortHash: "",
			dirs: dirs,
			version: pkg.version,
			banner: [
				"/*!",
				"* jQuery Mobile <%= version %>",
				"* <%if ( headHash ) {%>Git HEAD hash: <%= headHash %> <> <% } %>Date: " +
				grunt.template.today( "UTC:ddd mmm d yyyy HH:MM:ss Z" ),
				"* http://jquerymobile.com",
				"*",
				"* Copyright 2010, " + grunt.template.today( "UTC:yyyy" ) + " jQuery Foundation, Inc. and other" +
				" contributors",
				"* Released under the MIT license.",
				"* http://jquery.org/license",
				"*",
				"*/",
				"",
				"",
				""
			].join( grunt.util.linefeed ),

			bannerMin: "/*! jQuery Mobile <%= version %> | <%if ( headShortHash ) {%>Git HEAD" +
			"hash: <%= headShortHash %> <> <% } %>" + grunt.template.today( "UTC:yyyy-mm-dd" ) +
			"T" + grunt.template.today( "UTC:HH:MM:ss" ) + "Z | (c) 2010, " + grunt.template.today( "UTC:yyyy" ) +
			" jQuery Foundation, Inc. | jquery.org/license */\n"
		}
	} );
	grunt.registerTask( "release:init", function() {
		// Set the version suffix for releases
		grunt.config.set( "versionSuffix", "-" + pkg.version );
	});

	grunt.registerTask( "lint", [ "jshint" ] );

	grunt.registerTask( "changelog", ["changelog:create"] );

	grunt.registerTask( "js", [ "requirejs", "concat:js" ] );
	grunt.registerTask( "js:release",  [ "js", "uglify", "copy:sourcemap" ] );

	grunt.registerTask( "css", [ "cssbuild" ] );
	grunt.registerTask( "css:release", [ "css", "cssmin" ] );

	grunt.registerTask( "demos", [
		"concat:demos",
		"copy:images",
		"copy:demos.nested-includes",
		"copy:demos.processed",
		"copy:demos.php",
		"copy:demos.unprocessed",
		"copy:demos.backbone"
	]);

	grunt.registerTask( "cdn", [
		"release:init",
		"clean:jqueryCDN", "copy:jqueryCDN",
		"clean:tmp",
		"config:copy:googleCDN", "copy:googleCDN", "hash-manifest:googleCDN", "compress:googleCDN",
		"clean:tmp"
	]);

	grunt.registerTask( "dist", [
		"clean:dist",
		"config:fetchHeadHash",
		"js:release",
		"css:release",
		"demos",
		"compress:dist",
		"compress:images"
	]);
	grunt.registerTask( "dist:release", [ "release:init", "dist", "cdn" ] );
	grunt.registerTask( "dist:git", [ "dist", "clean:git", "config:copy:git:-git", "copy:git" ] );

	grunt.registerTask( "updateDependencies", [ "bowercopy" ] );

	grunt.registerTask( "test:demos:src", [ "php", "spider:demos.src" ] );

	grunt.registerTask( "test:demos:dist", [ "spider:demos.dist" ] );

	grunt.registerTask( "test",
		[
			"clean:dist",
			"clean:testsOutput",
			"jshint",
			"config:fetchHeadHash",
			"js:release",
			"css:release",
			"demos",
			"connect",
			"qunit:http"
		]
	);
	grunt.registerTask( "crawl",
		[
			"test:demos:src",
			"dist",
			"test:demos:dist"
		]
	);
	grunt.registerTask( "test:ci", [ "qunit_junit", "connect", "qunit:http" ] );

	// Default grunt
	grunt.registerTask( "default", [ "dist" ] );

};
