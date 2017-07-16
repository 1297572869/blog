/*
应用程序的入口文件
 */
//加载express模块
var express = require('express');
//加载swig模板处理模块
var swig = require('swig');
//加载mongoose模块
var mongoose = require('mongoose');
//加载body-parser 用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载 cookies
var Cookies = require('cookies');
//加载User
var User = require('./models/User');
//创建APP
var app = express();

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应__dirname+'/public'下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀
//第二个参数表示用于解析模板内容的方法
app.engine('html', swig.renderFile);
//设置模板文件的存放目录  第一个参数必须是views， 第二个参数是模板的路径
app.set('views', './views');
//注册模板引擎   第一个参数必须是view engine   第二个参数和app.engine这个方法中第一个参数是一致的
app.set('view engine', 'html');
//在开发过程中，需要取消模板的缓存
swig.setDefaults({cache: false});

//body-parser 的设置
app.use( bodyParser.urlencoded({extended: true}) );
//cookies的设置
app.use(function(req, res, next){
    req.cookies = new Cookies(req, res);

    //解析登录用户的cookies信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            //获取当前登录用户类型，是否是管理员
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            });
        }catch (e){
            next();
        }
    }else{
        next();
    }


});

/**
 * 根据不同功能划分模块
 */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


//监听http请求
mongoose.connect('mongodb://localhost:27018/blog', function(err){
    if(err){
        console.log('数据库链接失败');
    }else{
        console.log('数据库链接成功');
        app.listen(8080);
    }
});

