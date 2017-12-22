import {Injectable} from '@angular/core';
import {Platform, NavController} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import {ConfigurationService} from './configservice';


@Injectable()
export class LoginService {

    _config: ConfigurationService;
    _http;
    _user = {};
    constructor(public config: ConfigurationService, platform: Platform, http: Http, private _nav: NavController) {
        platform.ready().then(d=>{
          config.init().then(d=>{
            this._config = config;
            this._http=http;
          });

        });

    }

    post(uri, params){
      let headers = new Headers({
          'Content-Type':'application/json'
      });
      let options = new RequestOptions({
          headers: headers
      });
      return new Promise((resolve,reject) => {
          this._http.post(this._config.getConfig().SERVER_URI + uri,JSON.stringify(params),options).subscribe(d => {
              resolve(d);
          }, e => {
              reject(e);
          });
      });
    }

    slug(phone) {
      return new Promise((resolve,reject) => {
      this.post("/api/v2/users/slug",{phone: phone}).then((d)=>{
        let result = d.json();
        if(result.status && result.status==="ERROR") {
          reject("ERROR");
        } else {

          resolve(result);

        }
      }).catch(e=>{
        reject(e);
      });
    });
    }

    verifySlug(phone, slug) {
      return new Promise((resolve,reject) => {
      this.post("/api/v2/users/verifySlug",{phone: phone, slug:slug}).then((d)=>{
        let result = d.json();
        if(result.status && result.status==="ERROR") {
          reject(result);
        } else {
          resolve(result);
        }
      }).catch(e=>{
        reject(e);
      });
    });
    }

    login(phone, name) {
      return new Promise((resolve,reject) => {
      this.post("/api/v2/users/findByPhone",{phone: phone, name: name}).then((d)=>{
        let result = d.json();
        if(result.status && result.status==="ERROR") {
          reject("ERROR");
        } else {
          this._config.set("PHONE_NUMBER",phone);
          this._config.set("USER_ID",result._id);
          this._config.set("USER_NAME",result.firstName+ " " +result.lastName);
          resolve(result);

        }
      }).catch(e=>{
        reject(e);
      });
    });
    }
}
