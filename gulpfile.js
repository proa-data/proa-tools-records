const pckg = require('./package.json'),
	gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	mainBowerFiles = require('main-bower-files'),
	gulpSync = $.sync(gulp),
	browserSync = require('browser-sync').create();

const baseName = pckg.name,
	packageName = 'Proa Tools Records';

const paths = {
	src: 'src/',
	dist: 'dist/',
	demo: 'demo/',
	tmp: '.tmp/'
};

gulp.task('del:dist', () => delFolder(paths.dist));
gulp.task('styles:copy', () => processCss());
gulp.task('styles:min', () => processCss((stream) => stream.pipe($.cssnano()).pipe(renameMin())));
gulp.task('styles', ['styles:copy', 'styles:min']);

gulp.task('scripts:copy', () => processJs());
gulp.task('scripts:min', () => processJs((stream) => stream.pipe($.ngAnnotate()).pipe($.uglify()).pipe(renameMin())));
gulp.task('scripts', ['scripts:copy', 'scripts:min']);

gulp.task('build', gulpSync.sync([
	'del:dist',
	['styles', 'scripts']
]));

gulp.task('del:tmp', () => delFolder(paths.tmp));
gulp.task('index', ['build'], () => gulp.src(paths.demo+'index.html').pipe($.wiredep({devDependencies: true})).pipe($.useref()).pipe($.injectString.replace('{{PACKAGE_NAME}}', packageName)).pipe(gulp.dest(paths.tmp)));
gulp.task('fonts', () => gulp.src(mainBowerFiles()).pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}')).pipe(gulp.dest(paths.tmp+'fonts/')));

gulp.task('demo', gulpSync.sync([
	'del:tmp',
	['index', 'fonts']
]), () => browserSync.init({server: {baseDir: paths.tmp}}));

gulp.task('default', ['build']);

function delFolder(path) {
	return gulp.src(path, {read: false})
		.pipe($.clean());
}

function processCss(extraProcess) {
	return processStream(extraProcess, gulp.src(paths.src+'styles/index.less').pipe($.less()).pipe(addSpecialComment()).pipe($.rename({basename: baseName})));
}

function renameMin() {
	return $.rename({suffix: '.min'});
}

function processJs(extraProcess) {
	const firstJsFile = 'module.js';
	return processStream(extraProcess, gulp.src(paths.src+'scripts/*.js').pipe($.order([firstJsFile,'!'+firstJsFile])).pipe($.concat(baseName+'.js')).pipe(addSpecialComment()));
}

function processStream(process, stream) {
	return (process?process(stream):stream).pipe(gulp.dest(paths.dist));
}

function addSpecialComment() {
	const nl = '\n';
	return $.injectString.prepend('/*!'+nl+' * '+packageName+' v'+pckg.version+' ('+pckg.homepage+')'+nl+' */'+nl+nl);
}