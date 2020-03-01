/**
 * @author Joren Thijs
 * @version V1.0
 * @summary This gulp file contains all development and build tools for a standard website.
 * @description This file was made using Gulp V4.0.2.
 * It performs build tasks like compiling and hosting a dev server.
 * It also performs publish tasks like bundeling and minifying.
 * @tutorial type gulp watch to start the dev environment.
 * type gulp release to bundle and minify project and export it into the dist folder.
 */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourceMaps = require('gulp-sourcemaps');
const lineEndingCorrector = require('gulp-line-ending-corrector');
const concat = require('gulp-concat');
const htmlReplace = require('gulp-html-replace');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const strip_comments = require('gulp-strip-json-comments');
const prettier = require('gulp-prettier');
const browserSync = require('browser-sync').create();

// Configuration for the gulp-prettier formatter
const prettierOptions = {
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    semi: true,
    trailingComma: 'es5',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
    ],
};

/**
 * Compiles the scss in the '/scss/' folder into regular css into the '/css/' folder
 */
function compileSass() {
    return (
        gulp
            // Locate sass files
            .src('./src/scss/*.scss')
            // Initialize sourceMaps
            .pipe(sourceMaps.init())
            // Compile sass into css
            .pipe(sass().on('error', sass.logError))
            // Add support for older browsers
            .pipe(autoprefixer('last 2 versions'))
            // Format CSS
            .pipe(prettier(prettierOptions))
            // Correct Line endings
            .pipe(lineEndingCorrector())
            // Write sourceMaps
            .pipe(sourceMaps.write('./maps'))
            // Save the compiled css
            .pipe(gulp.dest('./src/css'))
            // Stream changes to all browsers
            .pipe(browserSync.stream())
    );
}

/**
 * Minify the css in the './src/css/' folder and publish it to the './dist/css/' folder.
 */
function bundleCSS() {
    return (
        gulp
            // Locate css files
            .src('./src/css/*.css')
            // Initialize sourceMaps
            .pipe(sourceMaps.init())
            // Bundle files
            .pipe(concat('styles.min.css'))
            // Remove comments
            .pipe(strip_comments())
            // Format CSS
            .pipe(prettier(prettierOptions))
            // Minify them
            .pipe(cleanCSS())
            // Correct Line endings
            .pipe(lineEndingCorrector())
            // Write sourceMaps
            .pipe(sourceMaps.write('./maps'))
            // Save the minified css
            .pipe(gulp.dest('./dist/css'))
    );
}

function bundleJS() {
    return (
        gulp
            // Locate JS files
            .src('./src/js/*.js')
            // Initialize sourceMaps
            .pipe(sourceMaps.init())
            // Bundle files
            .pipe(concat('bundle.min.js'))
            // Remove comments
            .pipe(strip_comments())
            // Format JS
            .pipe(prettier(prettierOptions))
            // Minify them
            .pipe(uglify())
            // Correct Line endings
            .pipe(lineEndingCorrector())
            // Write sourceMaps
            .pipe(sourceMaps.write('./maps'))
            // Save the minified JS
            .pipe(gulp.dest('./dist/js'))
    );
}

function bundleHTML() {
    return (
        gulp
            // Locate HTML Files
            .src('./src/*.html')
            // Replace dev CSS and JS references with bundle references
            .pipe(
                htmlReplace({
                    css: 'css/styles.min.css',
                    js: 'js/bundle.min.js',
                })
            )
            // Format HTML
            .pipe(prettier(prettierOptions))
            // Save the HTML Files
            .pipe(gulp.dest('./dist'))
    );
}

/**
 * Starts the dev server and watches for file changes
 */
function watch() {
    browserSync.init({
        server: {
            baseDir: './src',
        },
        open: false,
        reloadOnRestart: true,
    });
    compileSass();
    gulp.watch('./src/scss/**/*.scss', compileSass);
    gulp.watch('./src/*.html').on('change', browserSync.reload);
    gulp.watch('./src/js/**/*.js').on('change', browserSync.reload);
}

exports.build = compileSass;
exports.watch = watch;
exports.release = gulp.series(
    compileSass,
    gulp.parallel(bundleCSS, bundleJS, bundleHTML)
);
