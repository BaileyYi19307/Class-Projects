import fs from 'fs';


//generic Element class
export class GenericElement{
    constructor(name){
        this.name=name;

        //array to store the child classes
        this.children=[];
    }

    //add an attributre
    addAttr(name,value){
        this[name]=value;
    }

    //set an attribute
    setAttr(name,value){
        this[name]=value;
    }

    addAttrs(obj){
        //take the attributes of the object and map to this object
        Object.keys(obj).map(key=>this[key]=obj[key]);
    }

    removeAttrs(arr){
        //first filter out the attributes shared between the element and the array
        //and then delete them using map
        arr.filter(element=>Object.hasOwn(this,element)).map(element=>delete this[element]);
    }
    
    //add a new child to the child array
    addChild(child){
        this.children.push(child);
    }

    toString(){
		//combine all the attributes, but leave out the name and the children for now - will be added below
        const attributesStr= Object.keys(this)
        .filter(key => key!=="name" && key!=="children")
        .map(key =>`${key}="${this[key]}"`)
        .join(" ");
        
        //get all the children
        const childrenStr= this.children.map(child=>child.toString()).join('');
        
        //combine all the components
	    //if there are attributes, add it to the string
	    //otherwise, don't add it 
        return attributesStr ? `<${this.name} ${attributesStr}>${childrenStr}</${this.name}>` : `<${this.name}>${childrenStr}</${this.name}>`;      
    }

    write(filename,cb){
        //fileName is the path of the file
        //cb is the function to call when the writing is done
        if (filename){
            fs.writeFile(filename,this.toString(),cb);
        }
    }
}

//root element class
export class RootElement extends GenericElement{
    constructor(){
        super('svg');
        this.xmlns="http://www.w3.org/2000/svg";
    }
}


//text element class
export class TextElement extends GenericElement{
    constructor(x,y,fontSize,fill,content){
        super('text');
        this.addAttr("x",x);
        this.addAttr("y",y);
        this.addAttr("font-size",fontSize);
        this.addAttr("fill",fill);
        this.content = content; 
    }

    toString() {
        //create string of attributes; filter out name, children, content properties
        const attributesStr = Object.keys(this)
            .filter(key => key !== "name" && key !== "children" && key !== "content") // Exclude name, children, and content
            .map(key => `${key}="${this[key]}"`)//format as key="value" pair
            .join(" ");//join everything with a space

        //return the element in the format <tagName attributes>content</tagName>
        return `<${this.name} ${attributesStr}>${this.content}</${this.name}>`;
    } 
}


//rectangle element class
export class RectangleElement extends GenericElement{
    constructor(x,y,width,height,fill){
        super('rect');
        this.addAttr("x",x);
        this.addAttr("y",y);
        this.addAttr("width",width);
        this.addAttr("height",height);
        this.addAttr("fill",fill);
    }
}


// create root element with fixed width and height
const root = new RootElement();
root.addAttrs({width: 800, height: 170, abc: 200, def: 400});
root.removeAttrs(['abc','def', 'non-existent-attribute']);

// create circle, manually adding attributes, then add to root element
const c = new GenericElement('circle');
c.addAttr('r', 75);
c.addAttr('fill', 'yellow');
c.addAttrs({'cx': 200, 'cy': 80});
root.addChild(c);

// create rectangle, add to root svg element
const r = new RectangleElement(0, 0, 200, 100, 'blue');
root.addChild(r);

// create text, add to root svg element
const t = new TextElement(50, 70, 70, 'red', 'wat is a prototype? 😬');
root.addChild(t);

// show string version, starting at root element
console.log(root.toString());

// write string version to file, starting at root element
root.write('test.svg', () => console.log('done writing!'));