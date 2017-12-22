import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';

@Injectable()
export class ContactsService {

    _contacts;
    constructor(platform: Platform ){
      platform.ready().then((d)=>{
        this._contacts = window.navigator.contacts;
      });
    }

    public getContact(name) {
      return new Promise((resolve,reject)=>{
        this._contacts.find(['name','displayName'],function(arr){
          resolve(arr);
        },function(err){
          reject(err);
        },{filter:name,multiple:true, fields:['name'], desiredFields:['name','phoneNumbers']});
      });

    }
}
