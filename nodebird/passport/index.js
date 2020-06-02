const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const {User} = require('../models');

module.exports = (passport) => {
	/**
	 * serializeUser는 req.session 객체에 어떤 데이터를 저장할지 선택한다.
	 * serializeUser는 사용자 정보 객체를 세션에 아이디로 저장하는 것이
	 */
	passport.serializeUser((user, done) => {
		done(null, user.id);    //첫 번째 인자는 에러 발생 시 사용하는 것, 두 번째 인자가 중요하다.
	});

	/**
	 * 매 요청 시 실행된다.
	 * passport.session() 미들웨어가 이 메서드를 호출한다.
	 * 좀 전에 serializeUser에서 세션에 저장했던 id를 고받아 데이터베이스에서 사용자 정보를 조회한다.
	 * deserializeUser는 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러오는 것이다.
	 */
	passport.deserializeUser((id, done) => {
		User.findOne({
			where: { id },
			include: [{
				model: User,
				attributes: ['id', 'nick'],
				as: 'Followers',
			}, {
				model: User,
				attributes: ['id', 'nick'],
				as: 'Followings',
			}],
		})
			.then(user => done(null, user))
			.catch(err => done(err));
	});

	local(passport);
	kakao(passport);
};