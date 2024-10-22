// report.js
import fs from 'fs';
import {parse} from 'csv-parse';
import { rowsToObjects, stringFieldToList } from './hoffy.js';
import {RectangleElement,RootElement,TextElement} from './drawing.js';
import { mostStreamed,getSongsByKey,artistCounts} from './spotify.js';



//start by reading in the file
const path=process.argv[2];
    if (path){
    fs.readFile(path,'utf8',(err,data)=>{
        if (err){
            console.log("file could not be found");
        }
        else{
            //parse data
            let records=[];

            parse(data,{},(err,parseData)=>{
                const dataObject={};
                
                //set the headers to be the headers of the csv file
                dataObject.headers=parseData[0];
                //remove the first row
                parseData.splice(0,1);

                //set the rows to be the rest of the data, excluding first line
                dataObject.rows=parseData;
                
                //convert each line to an object, add to songArr
                records=rowsToObjects(dataObject);

                //put all artists name into a an array
                records=records.map(song=>stringFieldToList(song,"artist(s)_name"));


                //print out the entire movie object with most number of streams
                console.log(mostStreamed(records));
                console.log(getSongsByKey(records,"D#"));
    
                //artistCount returns an object of counts
                const artistCount=artistCounts(records);

                //sort
                const artistCountArr=Object.entries(artistCount);
                artistCountArr.sort((a, b) => b[1] - a[1]);

                //put top three into separate array
                const artistCountArray=[artistCountArr[0],artistCountArr[1],artistCountArr[2]];
                
                //print out top three artists as an object
                const topArtistObj=Object.fromEntries(artistCountArray);
                console.log(topArtistObj);


                  //draw an an svg that shows the top 3 popular artists
                // create root element with fixed width and height
                const root = new RootElement();
                root.addAttrs({width: 2000, height:2000 });


                //create the rectangles
                const rect1=new RectangleElement(0,0,100, Number(artistCountArray[0][1])*10,"orange");
                const rect2=new RectangleElement(110,0,100,Number(artistCountArray[1][1])*10,"aqua");
                const rect3=new RectangleElement(220,0,100,Number(artistCountArray[2][1])*10,"green");


                const text1 = new TextElement(0, Number(artistCountArray[0][1])*10+15, 15, 'black',artistCountArray[0][0]+", "+artistCountArray[0][1]);
                root.addChild(text1);

                const text2= new TextElement(110, Number(artistCountArray[1][1])*10+15, 15, 'black',artistCountArray[1][0]+", "+artistCountArray[1][1]);
                root.addChild(text2);

                const text3= new TextElement(220, Number(artistCountArray[2][1])*10+15, 15, 'black',artistCountArray[2][0]+", "+artistCountArray[2][1]);
                root.addChild(text3);

                root.addChild(rect1);
                root.addChild(rect2);
                root.addChild(rect3);
                root.write('artists.svg', () => console.log(''));

            });



        }

    });
}
