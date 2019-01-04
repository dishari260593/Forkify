//fetch doesnt work on all browsers.
//we import axios that is installed.
import axios from 'axios';
import {key, proxy} from '../config';

export default class Search{
    constructor(query){
        this.query=query;
    }

    async getResults(){
        //const key='fdae7dccb5a10a85ea26604646441994';
        //const proxy='https://cors-anywhere.herokuapp.com/';
        try{
        const res= await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
        this.result=res.data.recipes;
       
        }catch(error){
            alert(error);
        } 
       
    }
}

