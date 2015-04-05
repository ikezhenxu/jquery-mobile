var files = require( "../../files.js" );
var path = require( "path" );
var dist = "dist" + path.sep;

module.exports = {
	options: {
		banner: "<%= bannerMin =>",
		keepSpecialComments: 0
	},
	minify: {
		files: files.getMinifiedCSSFiles( dist )
	}
}