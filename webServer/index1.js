//引入要用的模块和导出网站目录
const http  = require("http");
const   fs  = require("fs");  
const wRoot = "/home/duo/work/nodejs/finisherCodeWebS/"         //根目录
const vRoot = "/home/duo/work/nodejs/finisherCodeWebS/error/";  //错误文件目录
const domin = "localhost";                                      // 合法域名
const indexFile = ["index.html","index.php","index.js"];        //入口文件

//创建一个webServer,读文件,返文件
const server = http.createServer();

//当request事件触发时,执行第二个参数(函数/句柄)
server.on("request",function(req,res){

    //找到正确文件并赋值给一个变量
    let resultFile = findFile(req);

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
        }
        res.writeHead(200,{"Content-type":"text/html"});
        res.write('<link rel="icon" href="data:image/ico;base64,aWNv">');
        res.end(data);
    })

})

//端口监听
server.listen(8080,function(){
    console.log("服务器已开启");
});

//找文件
function findFile(path){

    //取出主机名 
    const pointNum  = path.headers.host.split(":")[0];           

    //请求文件的完整路径
    const fullPath  = wRoot + path.url.split("/")[1];           

    //如果请求的域名是localhost  
    if(pointNum == domin){                                      
        try{
            // 路径是否存在
            if (fs.existsSync(fullPath)){

                // 路径是否是目录
                if(fs.statSync(fullPath).isDirectory()){

                    // 判断是否有入口文件
                    return isHaveIndexFile(fullPath);               
                
                //判断 后缀名是否合法
                }else {
                    return fileName(fullPath);                      
                }
             
            //如果目录不存在返回404
            }else {
                return vRoot + "404.html";                          
            }
            
        }catch(e){
            return vRoot + "404.html"; 
        }
    
    //如果不是合法域名返回500
    }else{                                                  
        return vRoot + "500.html";                              
    };

};

//判断是否有入口文件
function isHaveIndexFile(path) {

    //如果路径后面有 / ,则path路径就等于它本身,如果后面没有 / ,则path路径等于 path = / + path     [path.length-1]返回数组最后一个下标
    path = path[path.length-1] === '/' ? path : path + "/"; 
    
    for (let i = 0; i < indexFile.length; i++) {

        //只要path目录 + 入口文件其中之一存在 ,就返回path目录路径 + 入口文件
        if (fs.existsSync(path)) {
 
            return path + indexFile[i];
        }
    }
    return vRoot + "403.html";                  
}


//判断文件函数
function fileName(path){

    //不合法的后缀名
    const illegal = ["conf","json","txt"];             

    //请求文件的后缀名
    let judgePath = path.split(".")[1];                

    //indexOf()方法,从下标0开始读取,如果>=0,表示数组里的元素能和参数匹配,当匹配不上的时候返回<0数字
    if (illegal.indexOf(judgePath) >= 0) {             
        return vRoot + "503.html";
    }else {
        return path;
    }

}