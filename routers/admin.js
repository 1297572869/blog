var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

//初始判断用户是否有管理员权限
router.use(function(req, res, next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才能进入后台管理');
        return ;
    }
    next();
});

//统一返回格式
var responseData;

router.use(function (req, res, next){
    responseData = {
        code : 0,
        message : ''
    };
    next();
});

/**
 * 后台首页
 */
router.get('/', function(req, res){
    // res.send('后台管理首页');
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

/**
 * 用户管理页面
 */
router.get('/user', function(req, res){
    /**
     * 需要从数据库中读取所有用户数据
     *
     * limit(Number) : 限制从数据库中获取数据的条数
     *
     * skip() : 忽略数据的条数
     *
     * 每一页显示两条
     * 第一页 1-2 忽略0条-> （当前页-1）*限制条数
     * 第二页 3-4 忽略2条
     */
    var page = Number(req.query.page) || 1;
    var limit = 20;
    var pages = 0;

    User.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        //page不能超过pages
        page = Math.min(page, pages);
        //page不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1)*limit;

        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                limit: limit,
                pages: pages,
                count: count
            });
        });
    });

});

/**
 * 分类首页
 */
router.get('/category', function(req, res){
    var page = Number(req.query.page) || 1;
    var limit = 10;
    var pages = 0;

    Category.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        //page不能超过pages
        page = Math.min(page, pages);
        //page不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1)*limit;

        /**
         * sort()sort方法进行查询排序
         * 1：升序
         * -1: 降序
         */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                limit: limit,
                pages: pages,
                count: count
            });
        });
    });
});

/**
 * 分类添加
 */
router.get('/category/add', function(req, res){
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

/**
 * 分类添加保存
 */
router.post('/category/add', function(req, res){
    var name = req.body.name;

    if(name == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类名称不能为空'
        });
        return ;
    }

    Category.findOne({
        name: name
    }).then(function(categoryInfo){
        if(categoryInfo){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类名称已存在'
            });
            return Promise.reject();
        }
        var category = new Category({
            name: name
        });

        return category.save();
    }).then(function(newCategoryInfo){
        // responseData.message = '新增分类成功';
        // res.json(responseData);
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '新增分类成功',
            url: '/admin/category'
        });
    });
});

/**
 * 分类修改
 */
router.get('/category/edit', function(req, res){
    //获取要修改的分类ID
    var id = req.query.id || '';
    //查询要修改的信息，并以表单的形式展示出来
    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render('admin/error', {
               userInfo: req.userInfo,
                message: '分类信息不存在'
            });
        }else{
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});

/**
 * 分类修改保存
 */
router.post('/category/edit', function(req, res){
    var id = req.query.id || '';
    var name = req.body.name || '';

    Category.findOne({
        _id: id
    }).then(function(category){
        if(!category){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        }else{
            //当用户没有做任何修改
            if(name == category.name){
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '分类信息修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            }else{
                //数据库中已存在同名分类
                return Category.findOne({
                    _id: {$ne:id},
                    name: name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类信息修改成功',
            url: '/admin/category'
        });
    });
});

/**
 * 分类删除
 */
router.get('/category/delete', function(req, res){
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function(err){
        if(err){
            console.log(err);
        }
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除分类成功',
            url: '/admin/category'
        });
    });
});

/**
 * 内容首页
 */
router.get('/content', function(req, res){
    var page = Number(req.query.page) || 1;
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count){
        //计算总页数
        pages = Math.ceil(count/limit);
        //page不能超过pages
        page = Math.min(page, pages);
        //page不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1)*limit;

        /**
         * sort()sort方法进行查询排序
         * 1：升序
         * -1: 降序
         */
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate('category').populate('user').then(function(contents){
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                limit: limit,
                pages: pages,
                count: count
            });
        });
    });
});

/**
 * 内容增加
 */
router.get('/content/add', function(req, res){
    Category.find().sort({_id: -1}).then(function(categories){
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    });
});

/**
 * 内容增加保存
 */
router.post('/content/add', function(req, res){
    if(req.body.title == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return ;
    }
    //保存至数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(newContent){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容添加成功',
            url: '/admin/content'
        });
    });

});

/**
 * 内容修改
 */
router.get('/content/edit', function(req, res){
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: -1}).then(function(rs){
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content){
        if(!content){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            })
        }else{
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });
        }
    });
});

/**
 * 内容修改保存
 */
router.post('/content/edit', function(req, res){
    var id = req.query.id || '';
    if(req.body.title == ''){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return ;
    }
    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容修改成功',
            url: '/admin/content'
        });
    });

});

/**
 * 内容删除
 */
router.get('/content/delete', function(req, res){
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function(err){
        if(err){
            console.log(err);
        }
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除分类成功',
            url: '/admin/content'
        });
    });
});




module.exports = router;