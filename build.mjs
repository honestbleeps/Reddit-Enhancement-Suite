/* @flow */
/* eslint import/no-nodejs-modules: 0 */

// $FlowIssue
import fs from 'node:fs';
// $FlowIssue
import path from 'node:path';
import * as commander from 'commander';
import * as semver from 'semver';
import JSZip from 'jszip';
import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import flow from 'esbuild-plugin-flow';
import { sassPlugin } from 'esbuild-sass-plugin';

const targets = {
	chrome: {
		browserName: 'chrome',
		browserMinVersion: '114.0',
		manifest: './chrome/manifest.json',
	},
	chromebeta: {
		browserName: 'chrome',
		browserMinVersion: '114.0',
		manifest: './chrome/beta/manifest.json',
	},
	edge: {
		browserName: 'chrome',
		browserMinVersion: '114.0',
		manifest: './chrome/manifest.json',
	},
	opera: {
		browserName: 'chrome',
		browserMinVersion: '114.0',
		manifest: './chrome/manifest.json',
		noSourcemap: true,
	},
	firefox: {
		browserName: 'firefox',
		browserMinVersion: '115.0',
		manifest: './firefox/manifest.json',
		noSourcemap: true,
	},
}

const options = commander.program
	.option('--watch', 'Enable watch mode')
	.option('--zip', 'Enable zipping')
	.option('--mode <type>', 'Set the mode', 'development')
	.option('--browsers <list>', 'Specify browsers to target', 'chrome')
	.parse(process.argv)
	.opts();

const isProduction = options.mode === 'production';
const devBuildToken = `${Math.random()}`.slice(2);

async function buildForBrowser(targetName, { manifest, noSourceMap, browserName, browserMinVersion }) {
	const packageInfo = await fs.promises.readFile('./package.json').then(JSON.parse);
	const announcementsSubreddit /*: string */ = 'RESAnnouncements';
	const name /*: string */ = packageInfo.title;
	const author /*: string */ = packageInfo.author;
	const description /*: string */ = packageInfo.description;
	const version /*: string */ = packageInfo.version;
	const isBeta /*: boolean */ = (semver.minor(version) % 2) === 1;
	const isPatch /*: boolean */ = semver.patch(version) !== 0;
	const isMinor /*: boolean */ = !isPatch && semver.minor(version) !== 0;
	const isMajor /*: boolean */ = !isPatch && !isMinor && semver.major(version) !== 0;
	const updatedURL /*: string */ = isBeta ?
		// link to the release listing page instead of a specific release page
		// so if someone goes from the previous version to a hotfix (e.g. 5.10.3 -> 5.12.1)
		// they see the big release notes for the minor release in addition to the changes in the hotfix
		`https://redditenhancementsuite.com/releases/beta/#v${version}` :
		`https://redditenhancementsuite.com/releases/#v${version}`;
	const homepageURL /*: string */ = packageInfo.homepage;
	// used for invalidating caches on each build (executed at build time)
	// production builds uses version number to keep the build reproducible
	const buildToken = isProduction ? version : devBuildToken;

	const context = {
		entryPoints: {
			'foreground.entry': './lib/foreground.entry.js',
			'background.entry': './lib/background.entry.js',
			'options.entry': './lib/options/options.entry.js',
			'prompt.entry': './lib/environment/background/permissions/prompt.entry.js',
			manifest,
			options: './lib/options/options.scss',
			res: './lib/css/res.scss',
		},
		sourcemap: !isProduction || !noSourceMap,
		outdir: `./dist/${targetName}/`,
		bundle: true,
		metafile: true,
		target: [`${browserName}${browserMinVersion}`],
		loader: {
			'.svg': 'dataurl',
			'.gif': 'dataurl',
			'.png': 'dataurl',
			'.woff': 'dataurl',
		},
		define: {
			'process.env.BUILD_TARGET': `"${browserName}"`,
			'process.env.NODE_ENV': `"${options.mode}"`,
			'process.env.buildToken': `"${buildToken}"`,
			'process.env.announcementsSubreddit': `"${announcementsSubreddit}"`,
			'process.env.name': `"${name}"`,
			'process.env.author': `"${author}"`,
			'process.env.description': `"${description}"`,
			'process.env.version': `"${version}"`,
			'process.env.isBeta': `"${isBeta.toString()}"`,
			'process.env.isPatch': `"${isPatch.toString()}"`,
			'process.env.isMinor': `"${isMinor.toString()}"`,
			'process.env.isMajor': `"${isMajor.toString()}"`,
			'process.env.updatedURL': `"${updatedURL}"`,
			'process.env.homepageURL': `"${homepageURL}"`,
		},
		plugins: [
			flow(/\.jsx?$/),
			sassPlugin(),
			copy({
				assets: [
					{ from: ['./LICENSE'], to: ['./'] },
					{ from: ['./images/css-off-small.png'], to: ['./'] },
					{ from: ['./images/css-off.png'], to: ['./'] },
					{ from: ['./images/css-on-small.png'], to: ['./'] },
					{ from: ['./images/css-on.png'], to: ['./'] },
					{ from: ['./images/icon128.png'], to: ['./'] },
					{ from: ['./images/icon48.png'], to: ['./'] },
					{ from: ['./lib/environment/background/permissions/prompt.html'], to: ['./'] },
					{ from: ['./lib/options/options.html'], to: ['./'] },
					{ from: ['./node_modules/dashjs/dist/dash.mediaplayer.min.js'], to: ['./'] },
				],
			}),
			{
				name: 'build-manifest',
				setup(build) {
					build.onLoad({ filter: /manifest\.json$/ }, async args => {
						let text = await fs.promises.readFile(args.path, 'utf8')
						const replace = {
							__version__: version,
							__name__: name,
							__description__: description,
							__homepage__: homepageURL,
							__author__: author,
							__browser_min_version__: browserMinVersion,
						}
						Object.keys(replace).forEach(v => {
							text = text.replace(v, replace[v]);
						});
						JSON.parse(text); // Check if resulting JSON is valid
						return { contents: text, loader: 'copy' };
					});
				},
			}, options.zip ? {
				name: 'zip-build',
				setup(build) {
					const sourceDir = `./dist/${targetName}/`;
					const outPath = './dist/zip';
					build.onEnd(async () => {
						const zip = new JSZip();
						const files = await fs.promises.readdir(sourceDir);

						await Promise.all(files.map(async file => {
							const filePath = path.join(sourceDir, file);
							const content = await fs.promises.readFile(filePath);
							zip.file(file, content);
						}));

						const zipContent = await zip.generateAsync({ compression: 'DEFLATE', type: 'nodebuffer' });
						await fs.promises.mkdir(outPath, { recursive: true })
						await fs.promises.writeFile(`${outPath}/${targetName}.zip`, zipContent);
						console.log(`emitted zip file for ${targetName}`);
					})
				},
			} : undefined,
		].filter(Boolean),
	};

	if (options.watch) {
		console.log(`Watching ${targetName}; break to exit`);
		const ctx = await esbuild.context(context);
		await ctx.watch();
	} else {
		console.log(`building ${targetName}`);
		const result = await esbuild.build(context)
		fs.writeFileSync(`dist/esbuild-meta-${targetName}.json`, JSON.stringify(result.metafile))
	}
}

let buildTargets = options.browsers;
// browser option `all` converts to all available targets
buildTargets = [...new Set(buildTargets.replace('all', Object.keys(targets).join(',')).split(','))];
buildTargets.map(v => buildForBrowser(v, targets[v]));
