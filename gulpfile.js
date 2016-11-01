var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    browserSync = require('browser-sync').create(),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    imagemin = require('gulp-imagemin'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano');

// Пути до файлов
var path = {
    assets: {
        'styles': './assets/styles/',
        'templates': './assets/templates/',
        'scripts': './assets/js/',
        'images': './assets/img/',
        'fonts': './assets/fonts/',
        'vendor': './assets/vendor'
    },
    build: {
        'styles': './build/styles',
        'templates': './build',
        'scripts': './build/js',
        'images': './build/img',
        'fonts': './build/fonts'
    },
    watch: {
        'styles': './build/styles/**/*.scss',
        'templates': './build/templates/**/*.jade',
        'scripts': './build/js/**/*.js',
        'images': './build/img/**/*',
        'fonts': './build/fonts/**/*'
    }
};

// корневая папка сервера
var serverDir = './build';

// обработка шаблонов 
gulp.task('templates', function() {
    var data = require(path.assets.templates + 'data/data.json'); // данные для шаблонов
    gulp.src(path.assets.templates + '*.jade')
        .pipe(jade({
            locals: data
        }))
        .pipe(gulp.dest(path.build.templates))
        .pipe(browserSync.stream()); // перезагрузка сервера
});

// Обработка styles
gulp.task('styles', function() {
    var processors = [// ставим префиксы и сжимаем файл
        autoprefixer({ browsers: ['last 3 version'] }),
        cssnano(),
    ];
    return gulp.src(path.assets.styles + 'app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(gulp.dest(path.build.styles))
        .pipe(browserSync.stream()); // перезагрузка сервера
});

// Обработка скриптов
gulp.task('scripts', function() {
    gulp.src([
        './assets/vendor/jquery/dist/jquery.js',
        path.assets.scripts + '**/*.js'])
        // .pipe(browserify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(path.build.scripts))
        .pipe(browserSync.stream()); // перезагрузка сервера
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src([
            path.assets.fonts + '*',
            path.assets.vendor + 'font-awesome-sass/assets/fonts/font-awesome'
        ])
        .pipe(gulp.dest('./build/fonts/'));
});

// Спрайты картинок
gulp.task("sprite", function() {
    var spriteData = gulp.src(path.assets.images + 'sprite/*')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.scss',
            imgPath: '/img/sprite.png',
            padding: 30,
            cssVarMap: function(sprite) {
                sprite.name = 'icon_' + sprite.name;
            }
        }));
    spriteData.img.pipe(gulp.dest(path.build.images));
    spriteData.css.pipe(gulp.dest(path.build.styles));
});

// Картинки
gulp.task('images', function() {
    return gulp.src([path.assets.images + '**/*'])
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.images))
});

// Сервер
gulp.task('serve', ['styles'], function() {
    browserSync.init({
        server: serverDir
    });
    gulp.watch(path.watch.scripts, ['scripts']);
    gulp.watch(path.watch.styles, ['styles']);
    gulp.watch(path.watch.templates, ['templates'])
    gulp.watch(path.watch.images, ['images', 'sprite'])
});

// задачи по умолчанию
gulp.task('default', ['styles', 'templates', 'scripts', 'fonts', 'images', 'sprite']);
