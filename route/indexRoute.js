let express = require('express');
let router = express.Router();//获得路由对象
let path=require("path");
let myT=require(path.join(__dirname,"../tools/myT.js"));
let objectID = require('mongodb').ObjectId;


router.get('/', function(req, res) {//编写2级或更多级的注册
    if(req.session.userInfo){
        let userName=req.session.userInfo.userName;
        res.render(path.join(__dirname,"../statics/views/index.html"), {userName});//*渲染页面
    }else{
        myT.mess(res,'请先登陆！','/login');
    }
});

router.get('/insert', function(req, res) {
    //接收数据
    console.log(req.query);
    //插入数据
    myT.insert('userInfo',req.query,(err,result)=>{
        if(!err)res.json({
            mess:'新增成功',
            code:200
        })
    })
});

router.get('/delte', function(req, res) {
    //接收数据
    console.log(req.query.id);
    let id=objectID(req.query.id);
    //删除数据
    myT.delete('userInfo',{_id:id},(err,result)=>{
        if(!err)res.json({
            mess:'删除成功',
            code:200
        })
    })
});

router.get('/update', function(req, res) {
    //接收数据
    let address = req.query.address;
    let age = req.query.age;
    let introduction = req.query.introduction;
    let name = req.query.name;
    let phone = req.query.phone;
    let sex = req.query.sex;
    let id=objectID(req.query.id);
    //更新数据
    myT.update('userInfo',{_id:id},{address,age,introduction,name,phone,sex},(err,result)=>{
        if(!err)res.json({
            mess:'修改成功',
            code:200
        })
    })
});

router.get('/find', function(req, res) {
    //接收数据
    //更新数据
    myT.find('userInfo',{},(err,docs)=>{
        if(!err)res.json({
            mess:'查询成功',
            code:200,
            list:docs
        })
    })
});



module.exports = router;