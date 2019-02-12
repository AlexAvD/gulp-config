const {src, dest, parallel, series, watch, task} 
                    = require('gulp');
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const cleanCss      = require('gulp-clean-css');
const babel         = require('gulp-babel');
const uglify        = require('gulp-uglify');
const sourcemap     = require('gulp-sourcemaps');
const changed       = require('gulp-changed');
const del           = require('del');
const argv          = require('yargs').argv;
const gulpif        = require('gulp-if');
const browserSync   = require('browser-sync').create();


const SRC = './src/'
const DEST = './build/'

const p = {
    scss: {
        src: SRC + 'scss/main.scss',
        dest: DEST + 'css/',
    },
    js: {
        src: SRC + 'js/main.js',
        dest: DEST + 'js/',
    },
    html: {
        src: SRC + 'index.html',
        dest: DEST
    },
    watch: {
        scss: SRC + 'scss/**/*.scss',
        js: SRC + 'js/main.js',
        html: SRC + 'index.html',
    }

}


function scss() {
    return src(p.scss.src)
            .pipe(changed(p.scss.dest, {extension: '.css'}))
            .pipe(sourcemap.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['> 0.1%'],
                cascade: false
            }))
            .pipe(cleanCss({
                level: 2
            }))
            .pipe(sourcemap.write('./'))
            .pipe(dest(p.scss.dest))
            .pipe(browserSync.stream());
}

function html() {
    return src(p.html.src)
            .pipe(changed(p.html.dest))
            .pipe(dest(p.html.dest))
            .pipe(browserSync.stream());
}

function js() {
    return src(p.js.src)
            .pipe(changed(p.js.dest))
            .pipe(sourcemap.init())
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(sourcemap.write())
            .pipe(dest(p.js.dest))
            .pipe(browserSync.stream());
}

function server() {
    browserSync.init({
        server: DEST,
        notify: false
    });
    watch(p.watch.scss, scss);
    watch(p.watch.js, js);
    watch(p.watch.html, html);
}

function clean() {
    return del([DEST + '*']);
}


exports.build   = series(clean, parallel(js, html, scss));
exports.clean   = clean;
exports.dev     = series(parallel(js, html, scss), server);;


//task('build', series(clean, parallel(js, html, scss)));
//task('dev', series(parallel(js, html, scss), trace));