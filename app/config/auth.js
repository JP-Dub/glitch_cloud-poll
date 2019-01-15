'use strict';

module.exports = {
	'githubAuth': {
		'clientID': process.env.GITHUB_KEY,
		'clientSecret': process.env.GITHUB_SECRET,
		'callbackURL': process.env.APP_URL + 'auth/github/callback'
	}
};

/*
'googleAuth': {
		'clientID': process.env.GOOGLE_CLIENT_ID,
		'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
		'callbackURL': process.env.APP_URL + 'auth/google/callback'
	}
*/