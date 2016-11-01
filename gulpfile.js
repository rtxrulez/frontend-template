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
    cssnano = require('cssnano'),
    watch = require('gulp-watch');

// Пути до файлов
var path = {
    assets: {
        'styles':       './assets/styles/',
        'templates':    './assets/templates/',
        'scripts':      './assets/js/',
        'images':       './assets/images/',
        'fonts':        './assets/fonts/',
        'vendor':       './assets/vendor'
    },
    build: {
        'styles':       './build/styles',
        'templates':    './build',
        'scripts':      './build/js',
        'images':       './build/images',
        'fonts':        './build/fonts'
    },
    watch: {
        'styles':       './assets/styles/**/*.scss',
        'templates':    './assets/templates/**/*',
        'scripts':      './assets/js/**/*.js',
        'images':       './assets/images/**/*',
        'fonts':        './assets/fonts/**/*'
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
    var processors = [ // ставим префиксы и сжимаем файл
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
            path.assets.scripts + '**/*.js'
        ])
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
gulp.task('serv', function() {
    //запускаем вотчер для отслеживания файлов
    gulp.run('watch');

    // запускаем сервер 
    browserSync.init({
        server: serverDir // корневой каталог сервака 
    });
});

// Слежка над измененными файлами
gulp.task('watch', function() {
    // Предварительно все собираем
    gulp.run('default');

    watch(path.watch.styles, function() {
        gulp.run('styles');
    });

    watch(path.watch.templates, function() {
        gulp.run('templates');
    });

    watch(path.watch.scripts, function() {
        gulp.run('scripts');
    });

    watch(path.watch.images, function() {
        gulp.run('images');
        gulp.run('sprite');
    });
});

// задачи по умолчанию
gulp.task('default', ['styles', 'templates', 'scripts', 'fonts', 'images', 'sprite']);
