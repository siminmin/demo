Node.js实战：Express实现简单后台登录系统

1.建立Express项目
安装好nodejs和express框架,打开node命令行提示符,输入
```
express --view=ejs -e www
```
其中--view=ejs表示使用ejs模版引擎，-e指定项目名称，此处设为www。回车之后，当前文件夹下会多出一个名为www的文件夹，这个就是我们项目所在的地方。 此时，www文件夹中默认已经有了基本的文件，但是相关的依赖库还没有安装。 所以接着输入
```
cd www  
npm install 
```
此时项目已经安装完成，可以对www下的文件进行相关操作。

2.创建登录页面模版
views文件夹存放的是模版文件，我们在这个文件夹里创建一个登录页面模版，名称叫做login.ejs，模版的内容如下
```
<!DOCTYPE html>  
<html>  
<head>  
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">  
<meta http-equiv="Pragma" content="no-cache">  
<meta http-equiv="Cache-Control" content="no-cache">  
<meta http-equiv="Expires" content="0">  
<title>后台登录</title>  
<link href="/stylesheets/login.css" type="text/css" rel="stylesheet">
</head>  
<body>

<div class="login">  
    <div class="message">后台登录</div>
    <div id="darkbannerwrap"></div>

    <form method="post">
        <input name="action" value="login" type="hidden">
        <input name="username" placeholder="用户名" required="" type="text">
        <input name="password" placeholder="密码" required="" type="password">
        <input value="登录" style="width:100%;" type="submit" class="btn">
        <div id="show" align="center"></div>
    </form>
</div>



<script>  
    var failure = <%= flag %>;
    if(failure == 1) document.getElementById("show").innerText = "登陆失败！";
</script>  
</body>  
</html>  
```
页面样式文件login.css

右键另存为

将login.css保存到项目的public/stylesheets文件夹中

3. 创建后台管理页面模版
创建完登录页面模版，我们再创建一个简单的后台管理页面模版，功能是当用户成功登录后显示相应的后台信息。后台管理页面模版命名为admin.ejs，文件的内容如下
```
<!DOCTYPE html>  
<html>  
  <head>
    <title>后台管理页面</title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
  </head>
  <body>
    <h1><%= content %></h1>
  </body>
</html>  
```
此时，我们已经完成了网站后台的前端部分，接下来就是后端的实现了。

4. 后端实现思路
login页面：交由login.get和login.post路由器处理。

用户访问login页面时，调用login.get路由处理访问，渲染正常的登录页面。
当用户登录时，调用login.post路由处理登录请求，如果登录成功，则跳转到/admin页面；如果登录失败，则渲染带失败提示的登录页面。
admin页面：交由admin.get路由器处理。

如果用户未登录，则跳转到登录页面/login。
如果用户已登录，则渲染后台管理页面。

4.1 login.js路由文件
routes文件夹下存放的是路由中间件，我们首先在该文件夹下创建一个login.js文件，该文件将包含处理get请求和post请求的两个路由，用来处理登录页面的访问请求。 
注意：这里只对登录做了简单的判断，即如果用户名和密码与预先设定的相等，就将用户名写入到cookie中，之后通过简单判断cookie值是否等于用户名来判断用户是否已经登录。 在实际中还需要进一步地修改，比如：事先将用户名存到数据库中，当用户登录后，通过特定算法F加密用户名后作为cookie值发送给浏览器。之后每当收到带有cookie的请求时，先用算法F解密cookie值后得到用户名，再到数据库中查找该用户，如果用户存在，就认为该用户已登录，将其相关信息返回给浏览器。
```
var express = require('express');  
var getRouter = express.Router();  
var postRouter = express.Router();

/* 渲染登录页面 */
getRouter.get('/login', function(req, res, next) {  
    res.render('login', {flag: 0});
});

/* 处理登录请求 */
postRouter.post('/login', function(req, res) {  
    if(req.body.username == 'hello' && req.body.password == 'world') {
        res.cookie('authorized', req.body.username);
        res.redirect('/admin');
    }
    else{
        res.render('login', {flag: 1});
    }
})


exports.get = getRouter;  
exports.post = postRouter;  
```
4.2 admin.js路由文件
该文件含有一个处理get请求路由，用于处理后台管理页面的访问请求。
```
var express = require('express');  
var getRouter = express.Router();

getRouter.get('/admin', function (req, res) {  
   if(req.cookies.authorized) {
       res.render('admin', {content: '带cookie登陆成功！'});
   } else {
       res.redirect('/login');
   }
});

exports.get = getRouter; 
```
4.3 app.js主文件实现
```
var express = require('express');  
var path = require('path');  
var favicon = require('serve-favicon');  
var logger = require('morgan');  
var cookieParser = require('cookie-parser');  
var bodyParser = require('body-parser');

var login = require('./routes/login');  
var admin = require('./routes/admin')

var app = express();

// 设置模版引擎
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'ejs');

app.use(logger('dev'));  
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(cookieParser());  
app.use(express.static(path.join(__dirname, 'public')));

// 启用自定义的路由中间件
app.use(login.get);  
app.use(login.post);  
app.use(admin.get);

// 捕获404错误，并交由错误处理器处理
app.use(function(req, res, next) {  
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误处理器
app.use(function(err, req, res, next) {  
  // 只有在开发模式下才提供错误信息
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 渲染错误页面
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;  
```
至此，一个简单的后台登录系统已经完成。

5. 部署上线
打开命令提示符，切换到www文件夹下，然后执行
```
npm start  
```
此时，网站开始运行，可以通过
```
localhost:3000/login  
```
或者
```
127.0.0.1:3000/login  
```
来访问登录页面。

若想让网站在后台运行，可以使用命令
```
nohup npm start &  
```
或者安装专门的部署工具pm2
```
npm install -g pm2  
```
然后切换到bin目录下，执行
```
pm2 start www  
```
这样就能让网站长期在后台运行了。

注：我所使用的express版本默认运行在3000端口，如果你无法通过上述地址访问，请查看项目文件夹中的bin目录，用文本编辑器打开该目录下的www文件，应该能在第15行找到下列语句，||后面就是对应的端口号。
```
var port = normalizePort(process.env.PORT || '3000');  
```

以上内容转自网络：http://www.codebelief.com/article/2016/11/express-login-page-implementation/#toc-2

作者：Wray