const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {Op} = require("sequelize");

const {Post, Hashtag, User} = require('../models');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

fs.readdir('uploads', (error) => {
	if (error) {
		console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
		fs.mkdirSync('uploads');
	}
});

const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, callback) {
			callback(null, 'uploads/');
		},
		filename(req, file, callback) {
			const ext = path.extname(file.originalname);
			callback(null, path.basename(file.originalname, ext) + Date.now() + ext);
		},
	}),
	limits: {fileSize: 5 * 1024 * 1024},
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
	console.log(req.file);
	res.json({url: `/img/${req.file.filename}`});
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
	try {
		const post = await Post.create({
			content: req.body.content,
			img: req.body.url,
			userId: req.user.id,
		});
		const hashtags = req.body.content.match(/#[^\s#]*/g);
		if (hashtags) {
			const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
				where: {title: tag.slice(1).toLowerCase()},
			})));
			await post.addHashtags(result.map(r => r[0]));
		}
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
});

router.get('/hashtag', async (req, res, next) => {
	const query = req.query.hashtag;
	if (!query) {
		return res.redirect('/');
	}
	try {
		//쿼리스트링으로 해시태그 이름을 받고 해시태그가 존재하는지 검색
		const hashtag = await Hashtag.findOne({
			where: {
				title: {[Op.eq]: query}
			}
		});

		let posts = [];
		if (hashtag) {
			//시퀄라이즈에서 제공하는 getPosts 메서드로 모든 게시글을 가져온다.
			//가져올때는 작성자 정보를 JOIN 한다.
			posts = await hashtag.getPosts({
				include: [{
					model: User,
					attributes: ['id', 'nick','email'],
				}]
			});
			console.log(posts[0].dataValues);
		}

		return res.render('main', {
			title: `${query} | NodeBird`,
			user: req.user,
			twits: posts,
		});
	} catch (error) {
		console.error(error);
		return next(error);
	}
});

module.exports = router;