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
	}else{
		res.redirect('/');
	}
};