// hoffy.js
import fs from 'fs';


export function getEvenParam(s1,s2,s3,...sN){

    // if no arguments are passed in or only undefined ones are, give back an empty
    const paramsArr=[s1,s2,s3,...sN].filter(param => param !== undefined);

    if (paramsArr.length===0){
        return [];
    }

    //filter out even indices elements
    const evenParamsArr= paramsArr.filter(element => paramsArr.indexOf(element)%2===0);

    //return an array of parameters that have an even index
    return evenParamsArr;
}

export function myFlatten(arr2d){
    //flatten a 2d array so that all elements of the subarray become separate elements
    const flattenedArr=[];
    //push all the elements of each nested array into 1D array
    arr2d.map(innerArr=>flattenedArr.push(...innerArr));
    return flattenedArr;
}



export function maybe(fn){
    const newFn =(...args)=>{
        //filter out the params that are undefined or null
        const undefinedParamsArr=args.filter(param=> param === undefined|| param === null);
        const howManyUndefined=undefinedParamsArr.length;

        //if there are no undefined params, call old function
        if (howManyUndefined===0){
            return fn(...args);
        }
        //otherwise return undefined
        else{
            return undefined;
        }
    };
    return newFn;
}


export function filterWith(fn){
    const newFilterFn = (array)=>{
        //filter out elements where the function, used as a filter, returns true
        const filteredArr=array.filter(element => fn(element)===true);
        return filteredArr;
    };
    return newFilterFn;
}


export function repeatCall(fn,n,arg){
    //base case, if no more number of times to call function remain 
    //return 
    if (n===0){
        return;
    }
    //otherwise call the function and repeat n-1 remaining times
    fn(arg);
    repeatCall(fn,n-1,arg);
}

export function limitCallsDecorator(fn,n){
    //keep track of max num of calls 
    const maxNumber=n;
    //keep track of num of calls
    let numOfCalls=0;

    
    const newFn = (...args)=>{
        numOfCalls++;
        //check if num calls has not exceed max numbers
        //call original function
        if (numOfCalls<=maxNumber){
            return fn(...args);
        }
        //if exceeded limit, return undefined
        else{
            return undefined;
        }
    };
    return newFn;
}


export function myReadFile(fileName,successFn,errorFn){
    fs.readFile(fileName,'utf-8',(err,data)=>{
    // if there's an error while reading file, execute error function
    if (err){
        errorFn(err);
    }
    else{
        //otherwise execute success function
        successFn(data);
    }
    });
}


export function stringFieldToList(data,key){
    //convert comma separated string
    //to arrays of strings
    data[key]=data[key].split(",").map(x =>x.trim());
    return data;
}



export function rowsToObjects(data){
    //if the data exists
    if (data){
        //separate the headers and the data rows
        const headers = data.headers;
        const rows=data.rows;

        //for each row
        const objects = rows.map(row => 
            //for each element
            row.reduce((accumulator,element,index)=>
            {
            //set the key pair value
            accumulator[headers[index]]=element;
            //return the updated accumulator
            return accumulator;
            },{})
        );
        return objects;
    }
}