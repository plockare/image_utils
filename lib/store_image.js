'use strict';

let mkdirp = require('mkdirp');
let path = require('path');
let fs = require('fs');

module.exports = function (srcFolder, options, showLogs) {
	let dstFolder = options.dst || srcFolder;
	mkdirp.sync(dstFolder);
	return function (data) {
		return new Promise((resolve, reject) => {
			let imgPath = path.join(dstFolder, data.exifData.imageName);
			let originalPath = imgPath;
			let repetition = 0;
			while (fs.existsSync(imgPath + '.jpg')) {
				imgPath = originalPath + '_' + (++repetition);
			}
			let wr = fs.createWriteStream(imgPath + '.jpg', 'utf8');
			fs.createReadStream(data.img).pipe(wr);
			wr.on('close', ()=> {
				resolve();
			});
		})
			.then(()=> {
				return data;
			});
	};
};
