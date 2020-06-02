/**
 * 라우터 접근 권한 설정이 필요하다.
 * 로그인한 사용자는 회원가입과 로그인 라우터에 접근하면 안됨.
 * 반대로 로그인하지 않은 사용자는 로그아웃 라우터에 접근하면 안된다.
 */
exports.isLoggedIn = (req, res, next) => {
	//Pssport는 req 객체에 isAuthenticated 메서드를 추가하는데
	//로그인 중이면 true 아니면 falseㄹ르 반환한다.
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(403).send('로그인 필요');
	}
};

exports.isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/');
	}
};

exports.verifyToken = (req, res, next) => {
	try {
		//요청 헤더에 저장된 토큰(req.headers.authorization)을 사용한다.
		//사용자가 쿠키처럼 헤더에 토큰을 넣어 보낸다.
		req.decoded(jwt.verify(req.headers.authorization, process.env.JWT_SECRET));
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(419).json({
				code: 419,
				message: '토근이 만료되었습니다.'
			});
		}
		return res.status(401).json({
			code: 401,
			message: '유효하지 않은 토큰입니다.'
		});
	}
};