import {Injectable, Inject} from '@angular/core';
import {Platform, Alert, NavController} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import {ConfigurationService} from './configservice';

@Injectable()
export class CategoryFetcherService {
  _http: Http;
  _config : any;
  _uri='/api/categories';
  headers;
  options;
  constructor(platform: Platform, http: Http, config: ConfigurationService){
      console.log('category service: initialised');
      this._config = config.config;
      this._http = http;
      this.headers = new Headers({
            'Content-Type':'application/json'
        });
      this.options = new RequestOptions({
          headers: this.headers
      });
  }


  get(uri){
    return new Promise((res,rej)=>{
      console.log('category service: get all categories');
      this._http.get(this._config.SERVER_URI+uri,this.options)
      .subscribe(d => {
          res(d.json());
      }, e => {
          rej(e);
      });
    });
  }
}
