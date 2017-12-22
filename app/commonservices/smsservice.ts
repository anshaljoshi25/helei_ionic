import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Platform} from 'ionic-angular';
import {ConfigurationService} from './configservice';
@Injectable()
export class SmsService {
  _sms;
  headers;
  options;
  smsApi;
  _config;
  constructor(private _platform: Platform,private _http: Http, private config: ConfigurationService) {
    _platform.ready().then(d=>{
    this._sms = window.SMS;
    this._config = config.getConfig();
    this.headers = new Headers({
        'Access-Control-Allow-Origin':'*',
        'Content-Type':'application/json'
      });
    this.options = new RequestOptions({
        headers: this.headers
    });
    this.smsApi="/api/v2/sms/sendMultiple";
    }).catch(e=>{
      console.log("SmsService: Unable to initialize platform");
    });
  }

  public post(opts){
      var _this_ = this;
      return new Promise((resolve,reject) => {
          _this_._http.post(_this_._config.SERVER_URI+""+_this_.smsApi,JSON.stringify(opts),_this_.options).subscribe(d => {
              resolve(d);
          }, e => {
            console.log("SmsService: Unable to do http post!" + e);
            reject(e);
          });
      });
    }

  sendBulkItr(arr,pos,msg) {
    if(pos>=arr.length) {
      console.log("SmsService: Done sending all sms.");
      return;
    }
    let _this_=this;
    var nmsg = msg.replace(/{name}/g,arr[pos].name.givenName);
    var ph = arr[pos].phoneNumbers[0].value.replace(/[ -]/g,"");
    _this_._sms.sendSMS(ph,nmsg,function(s){
      _this_.sendBulkItr(arr,pos+1,msg);
    },function(e){
      console.log("SmsService: Cound not send sms to " + ph);
      _this_.sendBulkItr(arr,pos+1,msg);
    });
  }

  sendBulk(arr,text) {
    return new Promise((resolve,reject)=>{
      // if(this._sms!==undefined) {
        // this.sendBulkItr(arr,0,text);
        this.sendViaAPI(arr,text);
        console.log("starting");
        resolve({status:'OK',msg:'Running SmsService in background.'});
      // } else {
      //   reject("SmsService: No SMS service found!");
      // }
    });
  }

  sendViaAPI(arr, msg) {
    this.post({phones:arr,text:msg}).then(d=>{
      console.log(d);
    },e=>{
      console.log(JSON.stringify(e));
    });
  }
}
