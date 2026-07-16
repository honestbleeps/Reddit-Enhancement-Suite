/* @noflow */
/* eslint import/no-nodejs-modules: 0 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const defaultAppName = 'Reddit Enhancement Suite Safari';
const defaultBundleIdentifier = 'com.honestbleeps.redditenhancementsuitesafari';
const defaultAppCategory = 'public.app-category.utilities';

function getExtensionBundleIdentifier(bundleIdentifier) {
	return `${bundleIdentifier}.extension`;
}

function parseArgs(argv) {
	const flags = new Map();
	const entries = argv.entries();

	for (const [index, arg] of entries) {
		if (!arg.startsWith('--')) continue;

		const [rawKey, inlineValue] = arg.split('=');
		const key = rawKey.slice(2);
		if (inlineValue !== undefined) {
			flags.set(key, inlineValue);
			continue;
		}

		const next = argv[index + 1];
		if (next && !next.startsWith('--')) {
			flags.set(key, next);
			entries.next();
		} else {
			flags.set(key, true);
		}
	}

	return flags;
}

function run(command, args) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
	});

	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status || 1);
}

function patchProjectBundleIdentifiers(projectFile, bundleIdentifier) {
	if (!fs.existsSync(projectFile)) {
		throw new Error(`Safari Xcode project not found: ${projectFile}`);
	}

	const bundlePattern = /PRODUCT_BUNDLE_IDENTIFIER = (?:"([^"]+)"|([A-Za-z0-9._-]+));/g;
	const extensionBundleIdentifier = getExtensionBundleIdentifier(bundleIdentifier);
	const original = fs.readFileSync(projectFile, 'utf8');
	const updated = original.replace(bundlePattern, (match, quotedValue, bareValue) => {
		const currentValue = quotedValue || bareValue;
		const nextValue = /\.(Extension|extension)$/.test(currentValue) ? extensionBundleIdentifier : bundleIdentifier;
		const encoded = quotedValue ? `"${nextValue}"` : nextValue;
		return `PRODUCT_BUNDLE_IDENTIFIER = ${encoded};`;
	});

	if (original === updated) {
		throw new Error(`No PRODUCT_BUNDLE_IDENTIFIER entries were patched in ${projectFile}`);
	}

	fs.writeFileSync(projectFile, updated);
}

function patchAppInfoPlist(infoPlistFile, appCategory) {
	if (!fs.existsSync(infoPlistFile)) {
		throw new Error(`Safari app Info.plist not found: ${infoPlistFile}`);
	}

	const original = fs.readFileSync(infoPlistFile, 'utf8');
	let updated = original;

	const patchKeyValue = (key, valuePattern, valueBlock) => {
		const keyPattern = new RegExp(`<key>${key}<\\/key>\\s*${valuePattern.source}`);
		if (keyPattern.test(updated)) {
			updated = updated.replace(keyPattern, `<key>${key}</key>\n\t${valueBlock}`);
			return;
		}

		updated = updated.replace('</dict>', `\t<key>${key}</key>\n\t${valueBlock}\n</dict>`);
	};

	patchKeyValue('LSApplicationCategoryType', /<string>[^<]*<\/string>/, `<string>${appCategory}</string>`);
	patchKeyValue('ITSAppUsesNonExemptEncryption', /<(true|false)\/>/, '<false/>');

	if (updated === original) {
		throw new Error(`Could not patch application metadata in ${infoPlistFile}`);
	}

	fs.writeFileSync(infoPlistFile, updated);
}

const args = parseArgs(process.argv.slice(2));
const appName = args.get('app-name') || process.env.SAFARI_APP_NAME || defaultAppName;
const bundleIdentifier =
	args.get('bundle-identifier') ||
	process.env.SAFARI_BUNDLE_IDENTIFIER ||
	process.env.RES_SAFARI_BUNDLE_IDENTIFIER ||
	defaultBundleIdentifier;
const appCategory = args.get('app-category') || process.env.SAFARI_APP_CATEGORY || defaultAppCategory;
const source = path.resolve(args.get('source') || 'dist/safari');
const projectLocation = path.resolve(args.get('project-location') || 'dist/safari-xcode');
const validateBuild = args.has('validate-build');

if (!fs.existsSync(source)) {
	throw new Error(`Safari bundle not found at ${source}. Run "yarn build --browsers safari" first.`);
}

run('xcrun', [
	'safari-web-extension-converter',
	source,
	'--project-location', projectLocation,
	'--app-name', appName,
	'--bundle-identifier', bundleIdentifier,
	'--macos-only',
	'--swift',
	'--copy-resources',
	'--no-open',
	'--no-prompt',
	'--force',
]);

const projectDirectory = path.join(projectLocation, appName);
const projectPath = path.join(projectDirectory, `${appName}.xcodeproj`);
const projectFile = path.join(projectPath, 'project.pbxproj');
const appInfoPlistFile = path.join(projectDirectory, appName, 'Info.plist');

patchProjectBundleIdentifiers(projectFile, bundleIdentifier);
patchAppInfoPlist(appInfoPlistFile, appCategory);

console.log(`Patched Xcode bundle identifiers in ${projectFile}`);
console.log(`Patched application metadata in ${appInfoPlistFile}`);
console.log(`App bundle identifier: ${bundleIdentifier}`);
console.log(`Extension bundle identifier: ${getExtensionBundleIdentifier(bundleIdentifier)}`);
console.log(`App category: ${appCategory}`);

if (validateBuild) {
	run('xcodebuild', [
		'-list',
		'-project', projectPath,
	]);

	run('xcodebuild', [
		'-project', projectPath,
		'-scheme', appName,
		'-configuration', 'Debug',
		'-destination', 'platform=macOS',
		'build',
		'CODE_SIGNING_ALLOWED=NO',
	]);
}

console.log(`Open ${projectPath} in Xcode and run the containing app to enable the extension in Safari.`);
