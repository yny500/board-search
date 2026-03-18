import gulp from 'gulp'; // plugin 설치 및 가져오기
import del from 'delete';
import ws from 'gulp-webserver';
import image from 'gulp-image';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import fileinclude from 'gulp-file-include';
import miniCSS from 'gulp-csso'; // css 압축
import concat from 'gulp-concat'; // 파일 연결
import uglify from 'gulp-uglify'; // js 압축
import babel from 'gulp-babel'; // babel 사용

const routes = {
  html: {
    watch: 'src/**/*.html', // src 폴더 안에 모든 파일을 지켜봄
    src: 'src/*.html', // 해당 경로의 html로 끝나는 파일들(/**/은 폴더 내부까지 포함한단 의미)
    dist: 'dist' // 뿌려줄 경로(폴더, 목적지)
  },
  img: {
    src: 'src/img/*', // src/img 안의 모든 파일(확장자 지정 ex- src/img/*.png)
    dist: 'dist/img'
  },
  scss: {
    watch: 'src/scss/**/*.scss',
    src: 'src/scss/style.scss',
    dist: 'dist/css'
  },
  js: {
    watch: 'src/js/**/*.js',
    src: 'src/js/**/*.js',
    srcApps: 'src/js/apps/*.js',
    srcLibs: 'src/js/libs/*.js',
    dist: 'dist/js',
    distApps: 'dist/js/apps',
    basicFileName: 'main.js',
    minifyFileName: 'main.min.js',
    minifyLibsFileName: 'main.libs.min.js'
  }
};

const clean = () => del(['dist']); // 시리즈 추가, 괄호 안에 확장자나 폴더 이름 적어주기

// 웹 서버 설정
const webserver = () => gulp.src('dist').pipe(ws({ livereload: true, open: true })); // 서버에서 보여주고 싶은 폴더 지정

const html = () =>
  gulp
    .src(routes.html.src)
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file'
      })
    )
    .pipe(gulp.dest(routes.html.dist));

const sass = gulpSass(dartSass);
const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on('error', sass.logError)) // scss용 에러 설정
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dist));

const compileAppsJS = () =>
  gulp
    .src(routes.js.srcApps)
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(gulp.dest(routes.js.distApps));

const compileJS = () =>
  gulp
    .src(routes.js.srcApps)
    .pipe(concat(routes.js.basicFileName))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(gulp.dest(routes.js.dist));

const minifyJS = () =>
  gulp
    .src(routes.js.src)
    .pipe(concat(routes.js.minifyFileName))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(gulp.dest(routes.js.dist));

const minifyLibsJS = () => gulp.src(routes.js.srcLibs).pipe(concat(routes.js.minifyLibsFileName)).pipe(gulp.dest(routes.js.dist));

const watch = () => {
  gulp.watch(routes.html.watch, html);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, compileAppsJS);
  gulp.watch(routes.js.watch, compileJS);
  gulp.watch(routes.js.watch, minifyJS);
};

const img = () => gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dist));

const prepare = gulp.series([clean, img]); // dev 준비 과정에서 발생
// *ERR_REQUIRE_ESM 오류 발생시
// gulp-image 6.2.1버전으로 낮춰주면 됨
// -> npm install gulp-image@6.2.1 --save-dev

const assets = gulp.series([html, styles, compileAppsJS, compileJS, minifyJS, minifyLibsJS]);

const live = gulp.parallel([webserver, watch]); // 두가지 task를 병행할땐 parallel()로 사용

export const dev = gulp.series([prepare, assets, live]); // task들의 seires
// export는 package.json에서 쓸 명령어에만 사용하면 됨
// export X -> console이나 package.json에서 사용하지 못함
