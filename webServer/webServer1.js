//引入要用的模块和导出网站目录
const jsFile = require("./routing/d/e/f/index.js")();
const config  = require('./config.js');
const mime = require('mime')
const qs = require('querystring');
const http = require("http");
const url = require("url");
const fs = require("fs");



const wRoot = config.wRoot ;         //根目录
const vRoot  = config.vRoot;         //错误文件目录
const domin   = config.domin;        //合法域名
const indexFile = config.indexFile; //入口文件

const server = http.createServer();
server.on("request",function(req,res){

/*
通过请求找到服务器端的脚本文件,将这个脚本文件进行解析.并且将其结果返回给客户端
这个文件就是api脚本文件,这个程序(文件)让外部取调用的一个方法(暴露出来的)
*/

    let urlName = qs.parse(url.parse(req.url).query);//?部分的参数对象

    //请求文件的完整路径
    const fullPath = wRoot + req.url.split("?")[0]; 
    const   jsPath = wRoot+config.indexFile[2].split("?")[0]

    //找到正确文件并赋值给一个变量
    let resultFile = findFile(req);

    console.log(req.url)
        
    //判断如果访问的是d/e/f目录,导流至./routing/d/e/f/index.js 文件
    if(req.url === "/d/e/f"){       
        res.end(JSON.stringify(jsFile));
            return;       
    }

    //读取正确文件并返给客户端
    fs.readFile(resultFile,function(err,data){
        if(err){
            res.writeHead(500,{"Content-type":"text/html"}); 
            res.write("<html>");
            res.write("<head>");
            res.write('<meta charset="UTF-8">');
            res.write('<link rel="icon" href="data:image/ico;base64,aWNv">');
            res.write("<tittle>读取文件有误");
            res.write("</tittle>");
            res.write("</head>");
            res.write("<body>");
            res.write("<h1>没有正确读取到文件</h1>");
            res.write("<body>");
            res.write("</html>");
            res.end();
            return;
        }
        res.writeHead(200,{"Content-type":mime.getType(resultFile)});
        res.write('<link rel="icon" href="data:image/ico;base64,aWNv">');
        res.end(data);
        return;
    })
    

});

//端口监听
server.listen(8077,function(){
    console.log("服务器已开启");
});

//找文件
function findFile(path){
    
    //请求文件的完整路径
    const fullPath  = wRoot + path.url.split("?")[0]; 
    //取出主机名
    const pointNum  = path.headers.host.split(":")[0];    

    //如果请求的域名是localhost 
    if(pointNum !== domin){ 
        return vRoot + "404.html";
    }

    // 路径是否存在
    if (!fs.existsSync(fullPath)){
        return vRoot + "404.html"; 
    }
    
    //判断如果访问a/b/c目录,导流至./diversion/a/b/c/diversion.html文件
    // const badFile = wRoot+"/diversion/a/b/c";
    // if(fullPath === badFile){
    //     return badFile + "diversion.html";
    // }

    // //判断如果访问的是d/e/f目录,导流至./routing/d/e/f/index.js 文件
    // const inFile = wRoot + "/routing/d/e/f";
    // if(fullPath === inFile){
    //     return JSON.stringify(jsFile);
    // }


    // 路径不是目录
    if(!fs.statSync(fullPath).isDirectory()){
        //不是目录就是文件,则判断后缀名是否合法
        return fileName(fullPath);

    }else{
        //是目录就判断是否有入口文件
        return isHaveIndexFile(fullPath);
    }
}   


//判断是否有入口文件函数
function isHaveIndexFile(path){

    //如果路径最后一位没有/ 则给它加个 /
    path = path[path.length-1] === '/' ? path : path + "/"; 
    
    for (let i = 0; i < indexFile.length; i++) {

        //只要path目录 + 入口文件其中之一存在 ,就返回path目录路径 + 入口文件
        if (fs.existsSync(path+indexFile[i])) {
            return path + indexFile[i];
        }
    }
    return vRoot + "403.html";
}         


//判断文件后缀是否合法
function fileName(path){

    //不合法的后缀名
    const illegal = ["conf","json","txt"];             

    //请求文件的后缀名
    // let judgePath = path.split(".")[1];    
    let judgePath = path.split(".")[1];            

    //indexOf()方法,获取字符串首次出现的位置(下标),如果不存在,返回-1
    if (illegal.indexOf(judgePath) >= 0) {             
        return vRoot + "503.html";
    }else {
        return path;
    }
}