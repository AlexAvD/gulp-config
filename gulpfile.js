const { src, dest, parallel, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const babel = require("gulp-babel");
const webpack = require("webpack-stream");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const sourcemap = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const del = require("del");
const browserSync = require("browser-sync").create();

const INPUT_PATH = "./src";
const OUTPUT_PATH = "./build";

const PATHS = {
  scss: {
    src: `${INPUT_PATH}/scss/main.scss`,
    output: {
      filename: "template.css",
      dir: `${OUTPUT_PATH}/css/`,
    },
  },
  js: {
    src: `${INPUT_PATH}/js/**/*.js`,
    dist: `${OUTPUT_PATH}/js/`,
    outputFilename: "template.js",
  },
  html: {
    src: `${INPUT_PATH}/index.html`,
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
    html: `${INPUT_PATH}/index.html`,
    img: `${INPUT_PATH}/img/**/*.*`,
    fonts: `${INPUT_PATH}/fonts/**/*.*`,
  },
};

const styles = () => {
  return src(PATHS.scss.src)
    .pipe(sourcemap.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss({ level: 2, format: "beautify" }))
    .pipe(rename(PATHS.scss.output.filename))
    .pipe(sourcemap.write("."))
    .pipe(dest(PATHS.scss.output.dir))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src(PATHS.js.src)
    .pipe(sourcemap.init())
    .pipe(
      webpack({
        mode: "none",
        output: {
          filename: PATHS.js.outputFilename,
        },
      })
    )
    .pipe(babel({ presets: ["@babel/env"] }))
    .pipe(sourcemap.write("./"))
    .pipe(dest(PATHS.js.dist))
    .pipe(browserSync.stream());
};

const html = () => {
  return src(PATHS.html.src).pipe(dest(PATHS.html.dist)).pipe(browserSync.stream());
};

const fonts = () => {
  return src(PATHS.fonts.src).pipe(dest(PATHS.fonts.dist)).pipe(browserSync.stream());
};

const images = () => {
  return src(PATHS.img.src).pipe(imagemin()).pipe(dest(PATHS.img.dist)).pipe(browserSync.stream());
};

const clean = () => {
  return del(OUTPUT_PATH);
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

exports.clean = clean;
exports.dev = series(clean, parallel(scripts, html, styles, images, fonts), server, watchFiles);
