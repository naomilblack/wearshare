var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var pg = require('pg');
var cloudinary = require('cloudinary');
var pool = require("./pg-connection-pool");

var cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dr1gz6f3y',
  api_key: 647715557514671,
  api_secret: 'gqj5eFiuKTQ-JkKJCB1UIUo5usI'
});

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

const upload = multer({
  dest: './uploads'
});

app.get('/users', function(req,res){ //All users
	pool.query('SELECT * FROM users ORDER BY user_id').then(function(result){
		res.send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/users/:user_id', function(req,res){ //Get a particular user.
	var sql ='SELECT * FROM users WHERE user_id=$1::int;'
	var values = [ req.params.user_id ];
	pool.query(sql, values).then(function(result){
		res.status(201).send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	});
});

app.get('/articles', function(req,res){ //Get all articles. For Home page. 
	pool.query('SELECT * FROM articles').then(function(result){
		res.send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/outfits', function(req,res){ //Get all outfits. For Home page. 
	pool.query('SELECT * FROM outfits').then(function(result){
		res.send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/users/:user_id/outfits', function(req,res){ //Get outfits for a particular user. For outfits page.
	var sql ='SELECT * FROM outfits WHERE user_id=$1::int;';
	var values = [ req.params.user_id ];
	pool.query(sql, values).then(function(result){
		res.status(201).send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/outfits/top', function(req,res){ //Get highest ranked outfits. For home page. 
	pool.query('SELECT outfit_id FROM outfits order by total_score desc limit 5').then(function(result){
		res.status(201).send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/outfits/new', function(req,res){ //Get highest ranked outfits. For home page. 
	pool.query('SELECT outfit_id FROM outfits order by outfit_id desc limit 5').then(function(result){
		res.status(201).send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.get('/users/:user_id/articles', function(req,res){ //Get articles for a particular user. For articles page. 
	var sql ='SELECT * FROM articles WHERE user_id=$1::int;';
	var values = [ req.params.user_id ];
	pool.query(sql, values).then(function(result){
		res.status(201).send(result.rows);
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.post('/users', function(req,res){ //POST to users/Add a ner user. Admin only at the moment. 
	var sql ='INSERT INTO users (user_name, password) '
		+ 'VALUES ($1::text, $2::text)';
	var values = [ req.body.user_name, req.body.password ];
	pool.query(sql, values).then(function(result){
		res.status(201).send("Added");
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

app.post('/users/:user_id/articles', upload.single('file'), (req, res) => {

	if (req.file) {
   	 cloudinary.uploader.upload(req.file.path, ({ url }) => {
      if (url) {
      var sql ='INSERT INTO articles (user_id, image_path, article_type, article_name, article_desc) '
		+ 'VALUES ($1::int, $2::text, $3::text, $4::text, $5::text )';
		var values = [ req.params.user_id, url, req.body.article_type, req.body.article_name, req.body.article_desc ];
		pool.query(sql, values).then(function(result){
		res.status(201).send("Article Added!");
		}).catch(function(err){
		console.log(err);
		res.status(500).send("server error");
	});
      }
    })
  }
});

app.post('/users/:user_id/outfits', function(req,res){ //POST to outfits and associate with a particular user. 
	var sql ='INSERT INTO outfits (user_id, top_id, bottom_id, shoe_id, outfit_name) '
		+ 'VALUES ($1::int, $2::int, $3::int, $4::int, $5::text)';
	var values = [ req.params.user_id, req.body.top_id, req.body.bottom_id, req.body.shoe_id, req.body.outfit_name ];
	pool.query(sql, values).then(function(result){
		res.status(201).send("Outfit Added!");
	}).catch(function(err){
		console.log(err);
		res.status(500).send("server error");
	})
});

app.post('/outfits/update', function(req,res){ //Add a score to a particular outfit. 
	var sql ='UPDATE outfits SET total_votes = total_votes + 1, total_score = total_score + $2::int WHERE outfit_id=$1::int;'
	var values = [ req.body.outfit_id, req.body.score ];
	pool.query(sql, values).then(function(result){
		res.status(201).send("Rating");
	}).catch(function(err){
		console.log(err);
		res.status(500);
		res.send("server error");
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log('Server is now running on ' + port);
});

// somewhat1255
// taskkill /f /im node.exe