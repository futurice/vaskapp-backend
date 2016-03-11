'use strict';

// Decoding base-64 image
// Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
function decodeBase64Image(dataString)
{
	var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
	var response = {};

	if (matches.length !== 3)
	{
		return new Error('Base64 input string is in wrong format');
	}

	response.mimetype = matches[1];
	response.buffer = new Buffer(matches[2], 'base64');

	return response;
}

function decodeBase64String(value) {
	return new Buffer(value, 'base64').toString('ascii');
}

export {
	decodeBase64Image,
	decodeBase64String
};
