// app.mjs
import express from 'express';
import { Contact } from './contact.mjs';
import fs from 'fs';

//add appropriate import statements to enable static file serving
import url from 'url';
import path from 'path';
//import { UNSAFE_ViewTransitionContext } from 'react-router-dom';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let contacts=[];



const app=express();
app.use(express.static(path.join(__dirname, 'public')));

//middleware and logging 
//activate body parsing middleware - allows access to the content of the request's body
app.use(express.urlencoded({extended:true}));

app.use((req,res,next)=>{
    //log the request's method, path, requests
    console.log("Method: "+ req.method);
    console.log("Path: "+req.path);
    console.log(req.query);
    next();
});




//setup for handlebars
app.set('view engine','hbs');

//redirect to editor
app.get("/", (req, res) => {
    res.redirect('/editor');
});

//render the editory page and phone book page
app.get("/editor",(req,res)=>{
    res.render("editor",{});
});

app.get("/phonebook",(req,res)=>{
    if (req.query.contact){
        const searchedTerm=req.query.contact;

        //which contacts match? send to render call
        const match = contacts.filter(c=>c.name.includes(searchedTerm)|| (c.email.includes(searchedTerm) || c.phoneNumbers.filter(p=>p.includes(searchedTerm))).length!==0);
        if (match){
            res.render("phonebook",{contacts:match});
        }
        //otherwise don't render anything
    }
    else{
        res.render("phonebook",{contacts:contacts});
    }
});

app.post("/phonebook",(req,res)=>{
    console.log(req.body);
    const phoneNums=req.body.phoneNumbers.split(",");
    console.log(phoneNums);

    const newContact={'name':req.body.name,'email':req.body.email,'phoneNumbers':phoneNums};
    contacts.push(newContact);
    res.redirect(302, '/phonebook');

});

//create a function that
//takes in a Contact object
//returns a span element as a string
function decorate(contact){
    return `<span class="contact-info" title="Email: ${contact.email} \n Phone: ${contact.phoneNumbers}">${contact.name}</span>`;
}


app.post("/editor",(req,res)=>{
    //what's the string that they entered? 
    const stringEntered=req.body.formText;

    const modifiedText=contacts.reduce((acc,contact)=>{
        if (acc.includes(contact.name)){
            const newStr=acc.split(contact.name);
            return newStr.join(decorate(contact));
        }
        else{
            return acc;
        }
    },stringEntered);

    console.log("this is the string entered",stringEntered);

    res.render("editor",{modifiedText,originalText:stringEntered});
});

let server=null;


//global variable for initial data in the site
//stored as an array of contact instances

//read the phonebook.json file
fs.readFile(path.join(__dirname,'code-samples/phonebook.json'),'utf8',(err,data)=>{
    //parse the data
    const parsed=JSON.parse(data);

    //filter only contact objects
    contacts = contacts.filter(contact => contact instanceof Contact);

    //for each contact, create a corresponding contact object
    parsed.map(contact => contacts.push(new Contact(contact.name,contact.email,contact.phoneNumbers)));
    

    //print out global variable of contacts
    // console.log(contacts);

    //ensure server only starts after the file is read in
    server= app.listen(3000,()=>{
        console.log("Server started; type CTRL+C to shut down");
    });

});






export {server,app,decorate};
