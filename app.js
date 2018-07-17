let express = require('express');
let path=require("path");
var svgCaptcha = require('svg-captcha');
var session = require('express-session');
var bodyParser = require('body-parser');
let myT=require(path.join(__dirname,"tools/myT.js"));

//创建app
let app = express();

//静态资源中间件
app.use(express.static('statics'));

//body-parser中间件 简化post的获取
app.use(bodyParser.urlencoded({ extended: false }))

//express.session中间件
app.use(session({
    secret: 'keyboard cat'//必选项 自定义秘钥
}))

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
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    if(req.session.captcha==req.body.code){
        // console.log("验证success");
        myT.find('userInfo',{userName},(err,docs)=>{
            if(!err){
                if(docs.length==1){
                    //如果登陆成功，把账号和密码保存在 session中
                    req.session.userInfo={
                        userName
                    };
                    res.redirect('/index');
                }else{
                    myT.mess(res,'用户名或密码错误','/login');
                }
            }
        });
       
    }else{
        myT.mess(res,'验证码错误！','/login');
    }
});

//index.html
app.get("/index",(req,res)=>{
    if(req.session.userInfo){
        res.sendFile(path.join(__dirname,"statics/views/index.html"));
    }else{
        myT.mess(res,'请先登陆！','/login');
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
    myT.find('userInfo',{userName},(err,docs)=>{
        if(docs.length==0){
            myT.insert('userInfo',{userName,userPass},(err,result)=>{
                console.log(err);
                if(!err)myT.mess(res,'注册成功！','/login');
            });
        }else{
            myT.mess(res,'用户名已存在！','/register');
        }
    })
})

//监听
app.listen(4560,'127.0.0.1',()=>{
    console.log("成功")
});