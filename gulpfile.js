const { src, dest, parallel, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const babel = require("gulp-babel");
const webpack = require("webpack-stream");
const rename = require("gulp-rename");
const mode = require("gulp-mode")();
const uglify = require("gulp-uglify");
const newer = require("gulp-newer");
const sass = require("gulp-sass");
const sourceMap = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const del = require("del");
const browserSync = require("browser-sync").create();

const INPUT_PATH = "./src";
const OUTPUT_PATH = "./build";

const PATHS = {
  scss: {
    src: `${INPUT_PATH}/scss/index.scss`,
    output: {
      filename: "template.css",
      dir: `${OUTPUT_PATH}/css/`,
    },
  },
  js: {
    src: `${INPUT_PATH}/js/**/*.js`,
    output: {
      dir: `${OUTPUT_PATH}/js/`,
      filename: "template.js",
    },
  },
  html: {
    src: `${INPUT_PATH}/*.html`,
    dist: `${OUTPUT_PATH}`,
  },
  img: {
    src: `${INPUT_PATH}/images/**/*.*`,
    dist: `${OUTPUT_PATH}/images/`,
  },
  fonts: {
    src: `${INPUT_PATH}/fonts/**/*.*`,
    dist: `${OUTPUT_PATH}/fonts/`,
  },
  watch: {
    scss: `${INPUT_PATH}/scss/**/*.scss`,
    js: `${INPUT_PATH}/js/**/*.js`,
    html: `${INPUT_PATH}/*.html`,
    img: `${INPUT_PATH}/img/**/*.*`,
    fonts: `${INPUT_PATH}/fonts/**/*.*`,
  },
};

const styles = () => {
  return src(PATHS.scss.src)
    .pipe(mode.development(sourceMap.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(mode.production(cleancss({ level: 2, format: "beautify" })))
    .pipe(rename(PATHS.scss.output.filename))
    .pipe(mode.development(sourceMap.write(".")))
    .pipe(dest(PATHS.scss.output.dir))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src(PATHS.js.src)
    .pipe(webpack(require("./webpack.config")))
    .pipe(mode.development(sourceMap.init()))
    .pipe(mode.production(uglify()))
    .pipe(mode.development(sourceMap.write("./")))
    .pipe(dest(PATHS.js.output.dir))
    .pipe(browserSync.stream());
};

const html = () => {
  return src(PATHS.html.src).pipe(dest(PATHS.html.dist)).pipe(browserSync.stream());
};

const fonts = () => {
  return src(PATHS.fonts.src)
    .pipe(newer(PATHS.fonts.dist))
    .pipe(dest(PATHS.fonts.dist))
    .pipe(browserSync.stream());
};

const images = () => {
  return src(PATHS.img.src)
    .pipe(newer(PATHS.img.dist))
    .pipe(imagemin())
    .pipe(dest(PATHS.img.dist))
    .pipe(browserSync.stream());
};

const watchFiles = (done) => {
  watch(PATHS.watch.html, html);
  watch(PATHS.watch.scss, styles);
  watch(PATHS.watch.fonts, fonts);
  watch(PATHS.watch.img, images);
  watch(PATHS.watch.js, scripts);

  done();
};

const server = (done) => {
  browserSync.init({
    server: {
      baseDir: OUTPUT_PATH,
    },
    notify: false,
  });

  done();
};

const clean = () => {
  return del(OUTPUT_PATH);
};

const build = (done) => {
  series(clean, parallel(scripts, html, styles, images, fonts))(done);
};

const dev = (done) => {
  series(build, server, watchFiles)(done);
};

exports.clean = clean;
exports.build = build;
exports.dev = dev;
