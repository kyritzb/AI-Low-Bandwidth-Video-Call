import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const serverUrl = process.env.REACT_APP_SERVER + '/p2p' || 'http://localhost:8001' + '/p2p';
export const serverIO = process.env.REACT_APP_SERVER || 'http://localhost:8000';

console.log('-------------------------');
console.log('Image Processing Client started!');
console.log('-------------------------');
console.log(process.env);
console.log('-------------------------');
console.log('serverUrl:', serverUrl);
console.log('serverIO', serverIO);
console.log('-------------------------');

/*
===========================================================
   _____                          
  / ____|                         
 | (___   ___ _ ____   _____ _ __ 
  \___ \ / _ \ '__\ \ / / _ \ '__|
  ____) |  __/ |   \ V /  __/ |   
 |_____/ \___|_|    \_/ \___|_|   
                                  
===========================================================
*/

export function getRoom(roomName: string): Promise<any> {
    const urlEndpoint = serverUrl + '/room';
    const request = {
        roomName: roomName,
    };

    return new Promise((resolve, reject) => {
        axios
            .post(urlEndpoint, request)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                console.error(error);
            });
    });
}
