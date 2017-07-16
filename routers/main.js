var express = require('express');
var router = express.Router();

var Category = require('../models/Category');
var Content = require('../models/Content');

var data;

/**
 * 处理通用内容
 */
router.use(function(req, res, next){
    data = {
        userInfo: req.userInfo,
        categories: []
    };

    Category.find().sort({_id: -1}).then(function(categories){
        data.categories = categories;
        next();
    });
});

/**
 * 首页
 */
router.get('/', function(req, res){
    data.category = req.query.category || '';
    data.contents = [];
    data.count = 0;
    data.page = Number(req.query.page) || 1;
    data.limit = 10;
    data.pages = 0;

    var where = {};

    if(data.category){
        where.category = data.category;
    }

    Content.where(where).count().then(function(count){
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count/data.limit);
        //page不能超过pages
        data.page = Math.min(data.page, data.pages);
        //page不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1)*data.limit;

        return Content.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate('category').populate('user');
    }).then(function(contents){
        data.contents = contents;
        console.log(data);
        res.render('main/index', data);
    });
});

/**
 * 内容详情
 */
router.get('/view', function(req, res){
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content){
        data.content = content;
        data.category = content.category;

        content.views ++;
        content.save();
        res.render('main/view', data);
    });
});

module.exports = router;