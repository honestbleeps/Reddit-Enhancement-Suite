/* @noflow */

import test from 'ava';
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

test('Stylesheets compile without deprecated Sass imports or warnings', async t => {
	const result = await build({
		entryPoints: ['lib/css/res.scss', 'lib/options/options.scss', 'lib/vendor/index.scss'],
		bundle: true,
		write: false,
		outdir: 'dist/sass-test',
		logLevel: 'silent',
		loader: {
			'.svg': 'dataurl',
			'.gif': 'dataurl',
			'.png': 'dataurl',
			'.woff': 'dataurl',
		},
		plugins: [sassPlugin({ fatalDeprecations: ['import'] })],
	});

	t.deepEqual(result.warnings, []);
	t.is(result.outputFiles.length, 3);
	t.true(result.outputFiles.every(file => file.text.length > 0));
});
