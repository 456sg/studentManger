let express = require('express');
let path=require("path");
var svgCaptcha = require('svg-captcha');
var session = require('express-session')

let app = express();
//静态资源
app.use(express.static('statics'));

//
app.use(session({
    secret: 'keyboard cat'//必选项 自定义秘钥
}))

app.get("/login",(req,res)=>{
    res.sendFile(path.join(__dirname,"statics/views/login.html"));
})

app.get('/login/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    console.log(captcha.text);
	 req.session.captcha = captcha.text;
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
});

app.listen(4560,'127.0.0.1',()=>{
    console.log("成功")
});