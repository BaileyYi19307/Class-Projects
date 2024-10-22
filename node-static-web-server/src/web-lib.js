import * as path from "path";
import * as net from "net";
import * as fs from "fs";
import MarkdownIt from "markdown-it";

const MIME_TYPES = {
    "jpg" : "image/jpg",
    "jpeg" : "image/jpeg",
    "png" : "image/png",
    "html" : "text/html",
    "css" : "text/css",
    "txt" : "text/plain"
};

/**
 * returns the extension of a file name (for example, foo.md returns md)
 * @param fileName (String)
 * @return extension (String)
 */
function getExtension(fileName) {
    const formatPath = path.extname(fileName).toLowerCase();
    if (formatPath.startsWith(".")) {
        return formatPath.substring(1);
    }
    return formatPath;
}

/**
 * determines the type of file from a file's extension (for example,
 * foo.html returns text/html
 * @param: fileName (String)
 * @return: MIME type (String), undefined for unkwown MIME types
 */
function getMIMEType(fileName) {
    const ext = path.extname(fileName);
    return ext.length > 0 ? MIME_TYPES[ext.substring(1)] : null;
}

class Request {
    constructor(reqStr) {
        const [method, path] = reqStr.split(" ");
        this.method = method;
        this.path = path;
    }
}

class Response {

    static STATUS_CODES = {
        200 : "OK",
        308 : "Permanent Redirect",
        403: "Forbidden",
        404 : "Page Not Found",
        500 : "Internal Server Error"
    };

    constructor(socket, statusCode = 200, version = "HTTP/1.1") {
        this.sock = socket;
        this.statusCode = statusCode;
        this.version = version;
        this.headers = {};
        this.body = null;
    }

    setHeader(name, value) {
        this.headers[name] = value;
    }

    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    send(body) {
        this.body = body ?? "";
      
        if (!Object.hasOwn(this.headers, "Content-Type")) {
            this.headers["Content-Type"] = "text/html";
        }

        const statusCodeDesc = Response.STATUS_CODES[this.statusCode];

        const headersString = Object.entries(this.headers).reduce((s, [name, value]) => {
            return s + `${name}: ${value} \r\n`;
        }, "");

        this.sock.write(`${this.version} ${this.statusCode} ${statusCodeDesc}\r\n`);
        this.sock.write(`${headersString}\r\n`);
        this.sock.write(this.body);

        this.sock.end();
    }
}

class HTTPServer {
    constructor(rootDirFull, redirectMap) {

        //a string that represents the absolute path of the root directory
        this.rootDirFull = rootDirFull;
        
        //object that stores redirect mapping of routes, loaded from JSON files
        this.redirectMap = redirectMap;
        this.server = net.createServer(this.handleConnection.bind(this));
    }

    listen(port, host) {
        this.server.listen(port, host);
    }

    handleConnection(sock) {
        sock.on("data", data => this.handleRequest(sock, data));
    }

    handleRequest(sock, binaryData) {
        const req = new Request(binaryData.toString());
        const reqPathFull=this.rootDirFull.concat(req.path);
        let responseSent = false; // check if response has been sent


        //create HTML
        function createHTMl(dir,link,isDir){
            const isDirectory = isDir ? "/" : "";
            const href="<li><a href="+dir+link + isDirectory +">"+link+"</a></li>";
            return href;
        }

        // 1. handle redirects first
        //What's the request path
        const redirectPathsArr=Object.keys(this.redirectMap);

        redirectPathsArr.forEach(redirectPath=>{
            // are any paths in the redirect map found?
            // if it exists, send a response 
            if (req.path === redirectPath){
                //needs to be redirected
                const whereToRedirect=this.redirectMap[redirectPath];

                //make a response instance to redirect
                const r = new Response(sock,308);
                r.setHeader("Location",whereToRedirect);
                r.setHeader("Content-Type","text/html");
                r.send();
                responseSent = true; 

            }
        });


        // 2. if not a redirect and file/dir does not exist send back not found
        //if it wasn't a redirect


        if (!responseSent){
        // is there is a .. includeded in the req.path, send back Forbideen
        if (reqPathFull.includes("..")){
            const r = new Response(sock,403);
            r.setHeader("Content-Type","text/plain");
            r.send();
        }
        else{
            //check if the path exists in the "root" folder
            fs.access(reqPathFull, fs.constants.F_OK, (err) => {
                if(err) {
                    //path does not exist in root directory
                    const r = new Response(sock,404);
                    r.setHeader("Content-Type","text/plain");
                    r.send("Page Not Found");
                } else {
                    //path is readable

                    //check if it's a file
                    fs.stat(reqPathFull,(err,stats)=>{
                        const isFile=stats.isFile();


                        //if its a file
                        if (isFile){
                            
                            //check if it's markdown based on the extension
                            let isMarkDown=false;
                            if (getExtension(req.path)==="md"){
                                isMarkDown=true;
                            }

                            //read the file
                            fs.readFile(reqPathFull,(err,data)=>{
                                if (err){
                                    //if there's an error reading the path
                                    //send back a 500 status code response
                                    const errorResponse = new Response(sock,500);
                                    errorResponse.setHeader("Content-Type","text/plain");
                                    errorResponse.send();
                                }
                                else{
                                    //otherwise, data is fine to read in

                                    //what's the content type of the data?
                                    const contentType=getMIMEType(reqPathFull);
                                    //make a response object with 200 status code
                                    const r =new Response(sock);
                                    r.status(200);
                                    r.setHeader("Content-Type",contentType);

                                    //if the file is a markdown
                                    if (isMarkDown){
                                        //render the content and send back as a response
                                        const markdown = MarkdownIt({html: true});
                                        const rendered = markdown.render(data.toString());
                                        r.send(rendered);                                    
                                    }
                                    else{
                                    //if there's an error, send back a 500 response
                                        r.send(data);
                                    }

                                    //send internal server error response if something goes wrong
                                    //afer reading  the file
                                    sock.on('error', (error) => {
                                        r.status(500);
                                        r.setHeader("Content-Type", "text/plain");
                                        r.send('500 Internal Server Error\n',error);
                                    });
                 
                                }
                            });
                        }
                        


                        //if the path is a directory
                        else{
                            //create an HTML document that provides links to files in the directory
                            //use fs.readdir to read contents of existing directory 
                            //use absolute path

                            fs.readdir(reqPathFull,{withFileTypes:true},(err,files)=>{
                                if (err){
                                    //send back 500
                                    const r =new Response(sock,500);
                                    r.setHeader("Content-Type","text/plain");
                                    r.send();
                                }
                                else{
                                    //iterate over files will give back objects that have:
                                    //f.name and f.isDirectory() are available
                                    const hrefLinks=[];
                                    files.forEach(file =>{
                                        //create html for each directory/file
                                        //createHTML() function will handle if it's a directory/is it's a file
                                        const html=createHTMl(req.path,file.name,file.isDirectory());
                                        hrefLinks.push(html);
                                    });

                                    //join the dynamically created html with the html template
                                    const dynamicHtml = hrefLinks.join('\n');
                                    const htmlTemplate = `<!DOCTYPE html>
                                    <html lang="en">
                                    <head>
                                        <meta charset="UTF-8">
                                        <title>My HTTP Server</title>
                                    </head>
                                    <body>
                                    <ul>
                                        ${dynamicHtml}
                                    </ul>
                                    </body>
                                    </html>`;

                                    // create the response, send it once after processing all files
                                    const r = new Response(sock, 200);
                                    r.setHeader("Content-Type", "text/html");
                                    r.send(htmlTemplate); //send the final combined HTML response


                                }


                            });



                        }

                        

                    });



                }
            });
        }

    }
    }
}


export {
    Request,
    Response,
    HTTPServer
};