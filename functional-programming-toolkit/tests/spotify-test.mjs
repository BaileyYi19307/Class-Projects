import { expect } from "chai";
import { artistCounts, getSongsByKey, mostStreamed } from "../src/spotify.js";
import { records } from "./spotify-test-data.mjs";

describe('spotify', function () {
    describe('mostStreamed', function () {
        it('returns the song with the most streams', function () {
            const mostStreamedSong = mostStreamed(records);
            const danceMonkey = {
                track_name: 'Dance Monkey',
                'artist(s)_name': ['Tones and I'],
                artist_count: '1',
                streams: 2864791672,
                bpm: '98',
                key: 'F#',
                mode: 'Minor'
            };
            expect(mostStreamedSong).to.eql(danceMonkey);
        });
    });

    describe('getSongsByKey', function () {
        it('returns all the songs belonging to a particular key', function () {
            const key = "C#";
            const expected = [
                "SPRINTER (C#)",
                "FAMILY TIES (WITH KENDRICK LAMAR) (C#)",
                "DIE HARD (C#)",
                "DIE FOR YOU - REMIX (C#)",
                "CREEPIN' (C#)"
            ];
            expect(getSongsByKey(records, key)).to.have.all.members(expected);
        });
    });

    describe('artistCounts', function () {
        it('returns all the artists as keys and number of songs as the corresponding values', function () {
            const expected = {
                "Kendrick Lamar": 4,
                "The Weeknd": 3,
                "Dua Lipa": 2,
                "21 Savage": 1,
                "Amanda Reifer": 1,
                "Ariana Grande": 1,
                "Baby Keem": 1,
                "Blxst": 1,
                "Calvin Harris": 1,
                "Central Cee": 1,
                "Dave": 1,
                "Jay Rock": 1,
                "Lana Del Rey": 1,
                "Metro Boomin": 1,
                "Sabrina Carpenter": 1,
                "Sampha": 1,
                "Sean Paul": 1,
                "Taylor Swift": 1,
                "Tones and I": 1,
                "Young Thug": 1
            };
            expect(artistCounts(records)).to.eql(expected);
        });
    });
});
