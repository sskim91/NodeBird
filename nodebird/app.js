/***
 * 우주선의 조종실 같은 존재 app.js
 */
const express = require('express');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();
//외부에 공개하면 안되는 비밀 키 같은 값 들을 .env에 작성한다.
//.env 파일에 적은 키 값들을 가져온다. 서버 시작 시 .env의 비밀키들을 process.env에 넣으므로 process.env.키  로 사용할 수 있다.

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
app.set('view engine', 'njk');
nunjucks.configure('views', {
	autoescape: true,
	express: app
});
app.set('port', process.env.PORT || 8001);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
//이미지 경로 추가 uploads 폴더 내 사진들이 /img
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));   //urlencoded미들웨어가 해석한 req.body의 값
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: process.env.COOKIE_SECRET,
	cookie: {
		httpOnly: true,
		secure: false,
	},
}));
app.use(flash());
app.use(passport.initialize()); //요청(req 객체)에 passport 설정을 심는다.
app.use(passport.session());    //req.session 객체에 passport 정보를 저장한다.

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});

app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기중');
});