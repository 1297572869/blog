/**
 * Created by Administrator on 2017-06-28.
 */
var mongoose = require('mongoose');


//内容表结构
module.exports = new mongoose.Schema({
    //关联字段-内容分类id
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },

    //内容标题
    title: String,

    //关联字段-内容作者id
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },

    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //阅读量
    views: {
        type: Number,
        default: 0
    },

    //内容简介
    description: {
        type: String,
        default: ''
    },

    //内容
    content:{
        type: String,
        default: ''
    },

    //评论
    comments: {
        type: Array,
        default: []
    }

});