import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';
import {EventPage} from '../events/event'
/*
  Generated class for the SearchPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/search/search.html',
  providers: [ConfigurationService, EventsFetcherService]
})
export class SearchPage {
  _queryText;
  _timer;
  _events;
  _pagination;
  constructor(private nav: NavController, private _config: ConfigurationService, private _eventsFetcher : EventsFetcherService) {
    this._queryText = "";
    this._events=[];
    this._pagination = {pg:0, limit:10};
  }

  doInfinite(event) {
    this.queryMain().then(d=>{
      if(d) {
        event.complete();
      } else {
        if(this._pagination.pg>0)
        event.enable(false);
      }
    }).catch(e=>{
      event.complete();
    });
  }

  queryMain() {
    var _this_ = this;
    return new Promise((reject,resolve)=>{
      _this_._eventsFetcher.searchEvents(_this_._pagination.pg, _this_._pagination.limit,_this_._queryText).then(d=>{
        if(d.json()!==null && d.json()!=undefined && d.json().length) {
          _this_._events = _this_._events.concat(d.json());
          _this_._pagination.pg+=1;
          resolve(true);
        } else {
          resolve(false);
        }
        // _this_._events = _this_._events.concat(d.json());
        // resolve(d);
      },e=>{
        console.log(e);
        reject(e);
      });
    });
  }

  query() {
    var _this_ = this;
    clearTimeout(this._timer);
    _this_._pagination.pg=0;
    this._timer = setTimeout(function(){
      _this_._eventsFetcher.searchEvents(_this_._pagination.pg, _this_._pagination.limit,_this_._queryText).then(d=>{
        _this_._events = d.json();
      },e=>{
        console.log(e);
      });
    },500);
  }

  showEvent(event){
    this.nav.push(EventPage, {event: event});
  }
}
