'use strict';

let mkdirp = require('mkdirp');
let path = require('path');
let fs = require('fs');

module.exports = function (srcFolder, options, showLogs) {
	let dstFolder = options.dst || srcFolder;
	mkdirp.sync(dstFolder);
	return function (data) {
		let imgPath = path.join(dstFolder, data.exifData.imageName);
		let originalPath = imgPath;
		let repetition = 0;
		while (fs.existsSync(imgPath)) {
			imgPath = originalPath + (++repetition);
		}

		return new Promise((resolve, reject) => {
			data.img.write(imgPath + '.jpg', function (err) {
				if (err) {
					return reject(err);
				}
				resolve();
			})
		})
			.then(()=> {
				return data;
			});
	};
};
