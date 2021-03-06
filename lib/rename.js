'use strict';

let moment = require('moment');

module.exports = function (srcFolder, options, showLogs) {
	return function (data) {
		data.exifData.imageName = moment(data.exifData.exif.DateTimeOriginal || data.exifData.image.ModifyDate, 'YYYY:MM:DD HH:mm:ss').format('YYYY-MM-DD HH-mm-ss');
		return data;
	};
};
