var express     = require("express"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose");

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(expressSanitizer()); // Must go after the bodyParser

app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG.
var blogSchema= new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog=mongoose.model("Blog", blogSchema)

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1444212477490-ca407925329e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body: "HELLO THIS IS A BLOG POST!"
// });


// RESTFUL ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX ROUTE

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    })
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new")
})

// CREATE ROUTE

app.post("/blogs", function(req, res){
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            // then, redirect to the index
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE

app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });

});
// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
    // redirect somewhere

});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING");
});