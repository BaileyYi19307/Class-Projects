import * as webLib from './web-lib.js';
import * as path from "path";
import * as fs from "fs";

import { fileURLToPath } from 'url';

// TODO: configure and start server
//read in the sample config.json to get root directory
//the following 3 lines are taken from the homework instruction page
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const absolutePath=path.join(__dirname,'config.json');

fs.readFile(absolutePath,"utf-8",(err,data)=>{
    const config=JSON.parse(data);

    //create an instance of HTTPServer
    const http=new webLib.HTTPServer(config.root_directory,config.redirect_map);
    
    //listen on port 3000
    http.listen(3000,80);
    
});

