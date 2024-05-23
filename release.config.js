export default {
	branches: ['release'],
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'angular',
				releaseRules: [
					{ type: 'docs', scope: 'README', release: 'patch' },
					{ type: 'refactor', scope: 'core-*', release: 'minor' },
					{ type: 'refactor', release: 'patch' },
					{ scope: 'no-release', release: false },
				],
			},
		],
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/npm',
			{
				npmPublish: false,
			},
		],
		[
			'@semantic-release/git',
			{
				assets: ['dist/**/*', 'package.json'],
				message:
					'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
		'@semantic-release/github',
	],
};
