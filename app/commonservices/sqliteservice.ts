import {Injectable, Inject} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class SqliteService {
    storageService: any;
    db: any;
    result: any;

    constructor() {
        this.db = new Storage(LocalStorage);
    }

    get(key: string) {
      return new Promise((resolve,reject)=>{
        this.db.get(key).then(d=>{
          resolve(d);
        }).catch(e=>{
          reject(null)});
      });

    }

    set(key: string, val: string) {
      return new Promise((rs,rj)=>{
        this.db.set(key, val).then(d=>{rs(d)}).catch(e=>{
          rj(e)});
      });
    }

    remove(key: string) {
      return new Promise((resolve,reject)=>{
        this.db.remove(key).then(d=>{
          resolve(d);
        }).catch(e=>{
          reject(null)});
      });
    }


}
