/**
 * Created by jonat_000 on 3/12/2017.
 */
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const validate = require('mongoose-validator');
mongoose.connect('mongodb://localhost/message-board');
let MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Please enter a name'],
        minlength: [4, 'Name must be at least 4 characters'],

    },
    message: {
        type: String,
        required: [true, 'Please enter a message'],
        minlength: [4, 'Message must be at least 4 characters'],
    },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});
let CommentSchema = new mongoose.Schema({
    _message: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Quote',
    },
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        minlength: [4, 'Name must be at least 4 characters'],
    },
    comment: {
        type: String,
        required: [true, "Please enter a comment"],
        minlength: [4, 'Comment must be at least 4 characters'],
    }
});
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);
let Message = mongoose.model('Message');
let Comment = mongoose.model('Comment');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;
app.get('/', function (req, res) {
    Message.find({}).populate('comments').exec(function (err, messages) {
        Comment.find({}, function (err, comments) {
            if (!err) {
                res.render('index', {messages: messages, comments: comments});
            }
            else {
                res.render('index', {messages: false});
            }
        });
    });

});
app.post('/message', function (req, res) {
    let message = new Message({name: req.body.m_name, message: req.body.message});
    console.log(message);
    message.save(function (err) {
        if (!err) {
            console.log('message posted');
            res.redirect('/')
        }
        else {
            Message.find({}).populate('comments').exec(function (err, messages) {
                Comment.find({}, function (err, comments) {
                    if (!err) {
                        res.render('index', {messages: messages, comments: comments, errors: message.errors});
                    }
                    else {
                        res.render('index', {messages: false});
                    }
                });
            });
        }
    });

});
app.post('/comment/:id', function (req, res) {
    Message.findOne({_id: req.params.id}, function (err, message) {
        let comment = new Comment({name: req.body.c_name, comment: req.body.comment});
        comment._message = message._id;
        comment.save(function (err) {
            if (!err) {
                message.comments.push(comment);
                message.save(function (err) {
                    if (!err) {
                        res.redirect('/')
                    }
                    else {
                        console.log('message error');
                        res.redirect('/');
                    }
                })
            }
            else {
                console.log('comment error');
                res.redirect('/');
            }
        })
    });
    console.log('comment posted')
});
app.listen(8000, function() {
    console.log("listening on port 8000");
});