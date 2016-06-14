'use strict';

let Getopt = require('node-getopt');
let fs = require('fs');
let Jimp = require('jimp');
let path = require('path');
let ExifImage = require('exif').ExifImage;
require('any-promise/register/bluebird');
let Promise = require('any-promise');
let ProgressBar = require('progress');
let getopt = new Getopt([
	['r', '', 'Rename pictures to format YYYY-MM-DD HH-mm-ss'],
	['d', 'dst=path/to/destination/folder', 'Path where to store renamed pictures'],
	['v', 'verbose', 'Enable log messages'],
	['h', 'help']
]);

getopt.setHelp(
	"Usage: npm start source_directory [OPTION]\n" +
	"\n" +
	"[[OPTIONS]]\n"
).bindHelp();

let opt = getopt.parseSystem();
let showLogs = opt.options.verbose;
showLogs && console.log(opt);

if (opt.argv.length < 1) {
	console.error('Source directory is missing.');
	process.exit(1);
}

let srcFolder = opt.argv[0];

if (!fs.existsSync(srcFolder)) {
	console.error('Source directory does not exit.');
	process.exit(2);
}

let images = fs.readdirSync(srcFolder);

console.info('Number of items in folder: ' + images.length);
let bar = new ProgressBar('[:bar] :current/:total :percent :etas \t :image', {total: images.length, width: 20});
let functions = [];
opt.options.r && functions.push(require('./lib/rename'));

if (!functions.length) {
	console.error('No modifications selected');
	process.exit(3);
}

functions.push(require('./lib/store_image'));

Promise.each(
	images,
	image => {
		let imgPath = path.join(srcFolder, image);
		return functions.reduce((prev, cur)=> {
				return prev.then(cur(srcFolder, opt.options, showLogs));
			},
			Promise.props({
				img: Promise.resolve(imgPath),
				//img: Jimp
				//	.read(imgPath)
				//	.then(img => {
				//		showLogs && console.log(`Image ${imgPath} loaded.`);
				//		return img;
				//	}),
				exifData: new Promise((resolve, reject) => {
					new ExifImage({image: imgPath}, (error, exifData) => {
						showLogs && console.log('ExifData', exifData);
						if (error) {
							return reject(error);
						}
						exifData.imageName = image;
						resolve(exifData);
					});
				})
			})
		).
		then(()=> {
			bar.tick({
				image: imgPath
			})
		});
	})
	.then(()=> {
		console.log('Success');
		process.exit(0);
	})
	.catch(err => {
		console.error(err);
	});
