
import { myFlatten } from "./hoffy.js";

export function mostStreamed(records){
    //get number of streams for each song, filter out NaN values
    const numStreamsArr=records.map(song=>Number(song.streams)).filter(streams => !isNaN(streams));
    //take the maximum streams
    const largestNumStreams=Math.max(...numStreamsArr);

    //find song with maximum streams
    const mostStreamedSong=records.filter(song=>Number(song.streams)===largestNumStreams);
    return mostStreamedSong;
}


export function getSongsByKey(records,key){
    //extracts titles of all the song in a particulary key
    //returns titles of all songs followed by the key in parentheses
    //entire output should be in uppercase

    //which songs have this key?
    let songsWithKey=records.filter(song => song['key']===key);
        
    //now format the songs with the key they have
    songsWithKey=songsWithKey.map(song=> song['track_name'].toUpperCase() + ` (${key})`);

    return songsWithKey;
}

export function artistCounts(records){
    //flter out the records that do not have artist(s)_name column
    const artists=records.filter(song=>song["artist(s)_name"]);

    //flatten all occurences of each artist into a 1D array
    const artistsArr=artists.map(song=>song["artist(s)_name"]);
    const flattenedArtistsArr=myFlatten(artistsArr);
    
    //reduce into a single object with (artist: count) pairs
    return flattenedArtistsArr.reduce((acc,artist)=>{
        // if the artist exists, add one to count
        if (acc[artist]){
            acc[artist]++;
        }
        // if it doesnt, then we have encountered a new artist - set count equal to 1
        else{
            acc[artist]=1;
        }
        return acc;
    },{});

}