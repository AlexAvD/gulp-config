const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemap = require('gulp-sourcemaps');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();

const paths = {
	input: './src/',
	output: './dist/',
	scss: {
		src: './src/scss/main.scss',
		dist: './dist/css/'
	},
	js: {
		src: './src/js/**/*.js',
		dist: './dist/js/'
	},
	html: {
		src: './src/index.html',
		dist: './dist/'
	},
	img: {
		src: './src/img/**/*.*',
		dist: './dist/img/'
	},
	fonts: {
		src: './src/fonts/**/*.*',
		dist: './dist/fonts/'
	},
	watch: {
		scss: './src/scss/**/*.scss',
		js: './src/js/**/*.js',
		html: './src/index.html',
		img: './src/img/**/*.*',
		fonts: './src/fonts/**/*.*'
	}
};

const styles = () => {
	return src(paths.scss.src)
		.pipe(changed(paths.scss.dist, { extension: '.css' }))
		.pipe(sourcemap.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ cascade: false }))
		.pipe(cleanCss({ level: 2 }))
		.pipe(sourcemap.write('./'))
		.pipe(dest(paths.scss.dist))
		.pipe(browserSync.stream());
};

const scripts = () => {
	return src(paths.js.src)
		.pipe(changed(paths.js.dist))
		.pipe(sourcemap.init())
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(uglify())
		.pipe(sourcemap.write('./'))
		.pipe(dest(paths.js.dist))
		.pipe(browserSync.stream());
};

const html = () => {
	return src(paths.html.src)
		.pipe(changed(paths.html.dist))
		.pipe(dest(paths.html.dist))
		.pipe(browserSync.stream());
};

const fonts = () => {
	return src(paths.fonts.src)
		.pipe(changed(paths.fonts.dist))
		.pipe(dest(paths.fonts.dist))
		.pipe(browserSync.stream());
};

const images = () => {
	return src(paths.img.src)
		.pipe(changed(paths.img.dist))
		.pipe(imagemin())
		.pipe(dest(paths.img.dist))
		.pipe(browserSync.stream());
};

const clean = () => {
	return del(`${paths.output}*`);
};

const reload = (done) => {
	browserSync.reload();
	done();
};

const watchFiles = (done) => {
	watch(paths.watch.html, html);
	watch(paths.watch.scss, styles);
	watch(paths.watch.fonts, fonts);
	watch(paths.watch.img, images);
	watch(paths.watch.js, scripts);

	done();
};

const server = (done) => {
	browserSync.init({
		server: {
			baseDir: paths.output
		},
		notify: false
	});

	done();
};

exports.clean = clean;
exports.dev = series(
	clean,
	parallel(scripts, html, styles, images, fonts),
	server,
	watchFiles
);
