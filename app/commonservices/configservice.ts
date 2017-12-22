import {Injectable, Inject} from '@angular/core';
import {SqliteService} from './sqliteservice';
import {Alert, NavController} from 'ionic-angular';
@Injectable()
export class ConfigurationService {

    config: any = {};
    sqlService: any;
    nav: NavController;
    //config vars


    constructor( nav: NavController, sql: SqliteService) {
        this.sqlService = sql;
        this.nav = nav;
        //default
        this.init().then((c)=>{
          this.config=c;
        });
    }

    public init() {

      // this.sqlService.set("tmp","1").then(d=>{
      //   console.log(d);
      // }).catch(e=>{
      //   console.log(JSON.stringify(e));
      // });

        //this.sqlService.remove("dbPopulated").then(d=>{console.log("removed")}).catch(e=>{console.log(e)});
        return new Promise((resolve,reject)=>{
          this.sqlService.get("dbPopulated").then(d=>{
            //load all config vars
            if(d!==undefined && d!=="" && d!==null){
            Promise.all([
              this.sqlService.get("SERVER_URI"),
              this.sqlService.get("NOTIFICATIONS_ENABLED"),
              this.sqlService.get("PHONE_NUMBER"),
              this.sqlService.get("USER_ID"),
              this.sqlService.get("USER_NAME")
            ]).then(([SERVER_URI, NOTIFICATIONS_ENABLED, PHONE_NUMBER, USER_ID, USER_NAME])=>{
              //SERVER_URI
              this.config.SERVER_URI = SERVER_URI;
              this.config.NOTIFICATIONS_ENABLED = NOTIFICATIONS_ENABLED;
              this.config.PHONE_NUMBER = PHONE_NUMBER;
              this.config.USER_ID = USER_ID;
              this.config.USER_NAME = USER_NAME;
              resolve(this.config);

            }).catch(err=>{
              reject(err);
            });
          } else {

            this.sqlService.set("dbPopulated","YES");
            //all config params

            //SERVER_URI
            this.config.SERVER_URI = "http://192.168.0.108:8080";
            // this.config.SERVER_URI = "https://helei.co";
            this.sqlService.set("SERVER_URI",this.config.SERVER_URI);
            //NOTIFICATIONS_ENABLED
            this.config.NOTIFICATIONS_ENABLED = "TRUE"
            this.sqlService.set("NOTIFICATIONS_ENABLED",this.config.NOTIFICATIONS_ENABLED);
            //PHONE_NUMBER
            // this.config.PHONE_NUMBER = ""
            // this.sqlService.set("PHONE_NUMBER",this.config.PHONE_NUMBER);
            //TODO: Add more config vars
            resolve(this.config);
          }

          }).catch((e)=>{
            reject(e);
          });
        });

    }

    public getConfig() {
       return this.config;
    }

    public set(k,v) {
      this.config[k] = v;
      this.sqlService.set(k,this.config[k]);
    }


}
