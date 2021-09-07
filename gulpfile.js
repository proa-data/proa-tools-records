const pckg = require('./package.json'),
	gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	mainBowerFiles = require('main-bower-files'),
	injStr = $.injectString,
	browserSync = require('browser-sync').create();

const baseName = pckg.name,
	packageName = 'Proa Tools Records';

const paths = {
	src: 'src/',
	dist: 'dist/',
	demo: 'demo/',
	tmp: '.tmp/'
};

const nl = '\n';

gulp.task('del:dist', () => delFolder(paths.dist));
gulp.task('styles:copy', () => processCss());
gulp.task('styles:min', () => processCss((stream) => stream.pipe($.cssnano()).pipe(renameMin())));
gulp.task('styles', gulp.series('styles:copy', 'styles:min'));

gulp.task('scripts:copy', () => processJs());
gulp.task('scripts:min', () => processJs((stream) => stream.pipe($.ngAnnotate()).pipe($.uglify({output: {comments: '/^!/'}})).pipe(renameMin())));
gulp.task('scripts', gulp.series('scripts:copy', 'scripts:min'));

gulp.task('build', gulp.series('del:dist', gulp.parallel('styles', 'scripts')));

gulp.task('del:tmp', () => delFolder(paths.tmp));
gulp.task('index', gulp.series('build', () => gulp.src(paths.demo+'index.html').pipe($.wiredep({devDependencies: true})).pipe($.useref()).pipe(injStr.replace('{{PACKAGE_NAME}}', packageName)).pipe(gulp.dest(paths.tmp))));
gulp.task('styles:tmp', () => gulp.src(paths.src+'less/index.less').pipe(injStr.prepend('// bower:less'+nl+'// endbower'+nl)).pipe($.wiredep()).pipe($.less()).pipe($.rename({basename: baseName})).pipe(gulp.dest(paths.tmp+'styles/')));
gulp.task('fonts', () => gulp.src(mainBowerFiles()).pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}')).pipe(gulp.dest(paths.tmp+'fonts/')));

gulp.task('demo', gulp.series('del:tmp', gulp.parallel('index', 'styles:tmp', 'fonts'), () => browserSync.init({server: {baseDir: paths.tmp}})));

gulp.task('default', gulp.task('build'));

function delFolder(path) {
	return gulp.src(path, {read: false})
		.pipe($.clean());
}

function processCss(extraProcess) {
	return processStream(extraProcess, gulp.src(paths.src+'css/index.less').pipe($.less()).pipe(addSpecialComment()).pipe($.rename({basename: baseName})));
}

function renameMin() {
	return $.rename({suffix: '.min'});
}

function processJs(extraProcess) {
	const firstJsFile = 'module.js';
	return processStream(extraProcess, gulp.src(paths.src+'js/*').pipe($.order([firstJsFile,'!'+firstJsFile])).pipe($.concat(baseName+'.js')).pipe(addSpecialComment()));
}

function processStream(process, stream) {
	return (process?process(stream):stream).pipe(gulp.dest(paths.dist));
}

function addSpecialComment() {
	return injStr.prepend('/*!'+nl+' * '+packageName+' v'+pckg.version+' ('+pckg.homepage+')'+nl+' */'+nl+nl);
}