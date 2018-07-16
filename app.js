let express = require('express');
let path=require("path");
var svgCaptcha = require('svg-captcha');
var session = require('express-session');
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

let app = express();

//静态资源中间件
app.use(express.static('statics'));

//body-parser中间件 简化post的获取
app.use(bodyParser.urlencoded({ extended: false }))

//express.session中间件
app.use(session({
    secret: 'keyboard cat'//必选项 自定义秘钥
}))

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'studentManager';

//显示login.html 路由
app.get("/login",(req,res)=>{
    res.sendFile(path.join(__dirname,"statics/views/login.html"));
})

//显示验证码 路由
app.get('/login/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    console.log(captcha.text);
	req.session.captcha = captcha.text.toLowerCase();//把验证码存储在session中
	
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
});

//接收登陆表单 路由
app.post("/login",(req,res)=>{
    if(req.session.captcha==req.body.code){
        // console.log("验证success");
        //如果登陆成功，把账号和密码保存在 session中
        let userName=req.body.userName;
        let userPass=req.body.userPass;
        req.session.userInfo={
            userName,
            userPass
        };
        res.sendFile(path.join(__dirname,"statics/views/index.html"));
    }else{
        res.setHeader("content-type","text/html");
        res.send("<script>alert('验证码错误！');window.location.href='/login'</script>")
    }
});

//index.html
app.get("/index",(req,res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,"statics/views/index.html"));
    }else{
        res.setHeader("content-type","text/html");
        res.send("<script>alert('请先登陆！');window.location.href='/login'</script>")
    }
});

//退出
app.get("/logout",(req,res)=>{
    delete req.session.userInfo;
    res.redirect("/login");
})

//显示register.html页面 路由
app.get("/register",(req,res)=>{
    res.sendFile(path.join(__dirname,"statics/views/register.html"))
})

//接收register.html表单请求
app.post("/register",(req,res)=>{
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('userInfo');
        collection.find({userName}).toArray(function(err, docs) {
            if(docs.length==0){
                collection.insertOne({
                    userName,
                    userPass
                },(err,result)=>{
                    console.log(err);
                    // 注册成功了
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('登陆成功！');window.location='/login'</script>")
                    // 关闭数据库连接即可
                    client.close();
                })
            }else{
                res.setHeader('content-type','text/html');
                res.send("<script>alert('用户名相同！');window.location='/register'</script>")
            }
            
        });
    });
})

//监听
app.listen(4560,'127.0.0.1',()=>{
    console.log("成功")
});