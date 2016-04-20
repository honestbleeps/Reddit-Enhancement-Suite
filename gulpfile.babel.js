import globby from 'globby';
import gulp from 'gulp';
import merge from 'merge-stream';
import path from 'path';
import zip from 'gulp-zip';

gulp.task('zip', () =>
	merge(
		globby.sync(['dist/*', '!dist/zip']).map(dir =>
			gulp.src(path.join(dir, '**/*'))
				.pipe(zip(`${path.basename(dir)}.zip`))
				.pipe(gulp.dest('dist/zip'))
		)
	)
);
