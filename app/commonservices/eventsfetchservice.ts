import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import {ConfigurationService} from './configservice';

@Injectable()
export class EventsFetcherService {
    _http: Http;
    _config;
    headers;
    options;
    constructor(platform: Platform, http: Http, config: ConfigurationService) {
        //fetch data
        this._http = http;
        this._config = config.getConfig();
        this.headers = new Headers({
              'Content-Type':'application/json'
          });
        this.options = new RequestOptions({
            headers: this.headers
        });

    }

  public post(api,opts){
      var _this_ = this;
      return new Promise((resolve,reject) => {
          _this_._http.post(this._config.SERVER_URI + api,JSON.stringify(opts),_this_.options).subscribe(d => {
              resolve(d);
          }, e => {
            console.log("EventsFetcherService: Unable to do http post!" + e);
            reject(e);
          });
      });
    }

    postByConfig(api,opts,config){
      var _this_ = this;
      return new Promise((resolve,reject) => {
          _this_._http.post(config.SERVER_URI + api,JSON.stringify(opts),_this_.options).subscribe(d => {
              resolve(d);
          }, e => {
            console.log("EventsFetcherService: Unable to do http post!" + e);
            reject(e);
          });
      });
    }

    getEvents(pg,limit,filters) {
        var _this_ = this;
        return new Promise((resolve,reject) => {
            _this_.post("/api/v2/events",{"pg":pg,"limit":limit,"filters":filters}).then(d => {
                resolve(d);
            }).catch(e => {
                reject(e);
            });
        });
    }

    getCategoriesByConfig(config) {
      return new Promise((resolve,reject) => {
          this.postByConfig("/api/v2/categories",{dummy:'var'},config).then(d => {
              resolve(d);
          }).catch(e => {
            console.log(e);
              reject(e);
          });
      });
    }
    getCategories() {
      return new Promise((resolve,reject) => {
          this.post("/api/v2/categories",{dummy:'var'}).then(d => {
              resolve(d);
          }).catch(e => {
            console.log(e);
              reject(e);
          });
      });
    }

    searchEvents(pg,limit,query) {
      return new Promise((resolve,reject) => {
          this.post("/api/v2/core/searchEvents",{searchText:query, pg: pg, limit:limit}).then(d => {
              resolve(d);
          }).catch(e => {
            console.log(e);
              reject(e);
          });
      });
    }
}
