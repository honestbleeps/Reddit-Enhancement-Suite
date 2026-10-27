/* @noflow */
/* eslint-disable import/no-nodejs-modules */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import strip from 'flow-remove-types';

export async function loadModule(entry, mocks, globals) {
	const result = await build({
		entryPoints: [fileURLToPath(entry)],
		bundle: true,
		write: false,
		format: 'cjs',
		plugins: [{
			name: 'test-modules',
			setup(builder) {
				builder.onResolve({ filter: /.*/ }, ({ path }) =>
					Object.hasOwn(mocks, path) ? { path, namespace: 'mock' } : undefined);
				builder.onLoad({ filter: /.*/, namespace: 'mock' }, ({ path }) => ({ contents: mocks[path] }));
				builder.onLoad({ filter: /\.js$/, namespace: 'file' }, async ({ path }) => ({
					contents: strip(await readFile(path, 'utf8')).toString(),
				}));
			},
		}],
	});

	const runtimeModule = { exports: {} };
	runInNewContext(result.outputFiles[0].text, { module: runtimeModule, URL, ...globals });
	return runtimeModule.exports;
}
