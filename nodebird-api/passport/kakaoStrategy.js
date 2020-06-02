const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
	passport.use(new KakaoStrategy({
		clientID: process.env.KAKAO_ID,
		clientSecret: '', // clientSecret을 사용하지 않는다면 넘기지 말거나 빈 스트링을 넘길 것
		callbackURL: '/auth/kakao/callback',
	}, async (accessToken, refreshToken, profile, done) => {
		try {
			const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });
			if (exUser) {
				done(null, exUser);
			} else {
				const newUser = await User.create({
					email: profile._json && profile._json.kaccount_email,
					nick: profile.displayName,
					snsId: profile.id,
					provider: 'kakao',
				});
				done(null, newUser);
			}
		} catch (error) {
			console.error(error);
			done(error);
		}
	}));
};