var files = require( "../../files.js" );
var path = require( "path" );
var dist = "dist" + path.sep;
var tmp = path.join( dist, "tmp" );
module.exports = {
	dist: {
		options: {
			archive: files.distZipOut
		},
		files: [
			{
				expand: true,
				cwd: "<%= dist %>",
				src: files.distZipContent
			}
		]
	},
	images: {
		options: {
			archive: files.imagesZipOut
		},
		files: [
			{
				expand: true,
				cwd: "<%= dist %>",
				src: [ "images/**" ]
			}
		]
	},
	"googleCDN": {
		options: {
			archive: files.googleCDNZipOut
		},
		files: [
			{
				expand: true,
				cwd: tmp,
				src: [ "**/*" ]
			}
		]
	}
};