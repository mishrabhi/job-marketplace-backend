const express = require('express');

const rawParser = express.raw({ type: 'application/json' });

// wrapper that ensures req.rawBody is set to the raw Buffer
function rawBody(req, res, next) {
	rawParser(req, res, function (err) {
		if (err) return next(err);
		req.rawBody = req.body;
		return next();
	});
}

module.exports = rawBody;
