import {Component} from '@angular/core';
import {NavController, NavParams, Platform, ViewController, Modal, Loading, Popover, MenuController} from 'ionic-angular';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventPage} from '../events/event';
import {CreateEventPage} from '../eventcreate/eventcreate';
import {InvitePage} from '../invite/invite';

@Component({
  templateUrl: 'build/pages/attending/attending.html',
  providers:[ConfigurationService, EventsFetcherService]
})
export class AttendingTab {
  eventsFetcher:any;
  _config:any;
  createdEvents=[];
  subscribedEvents=[];
  constructor(private navController: NavController,private _navParams: NavParams,private config: ConfigurationService,private platform: Platform,eventsFetcher:EventsFetcherService) {
    console.log('on attending tab');
    this.eventsFetcher = eventsFetcher;
    platform.ready().then(d=>{
      config.init().then(d=>{
        this._config = config.getConfig();
        console.log('platform and config initializedbfgsgg');
        this.loadCreatedEvents();
        this.loadSubscribedEvents();
      });
    });

  }

  loadCreatedEvents(){
    console.log('loading created events');
    console.log(this._config);
    this.eventsFetcher.post('/api/v2/events/listByCreator',{uid:this._config.USER_ID})
    .then(d=>{
      this.createdEvents=this.createdEvents.concat(d.json());
      // console.log(this.createdEvents);
    })
    .catch(ep=>{
      console.log(ep);
    })
  }

  loadSubscribedEvents(){
    console.log('loading created events');
    console.log(this._config);
    this.eventsFetcher.post('/api/v2/events/accepted',{uid:this._config.USER_ID})
    .then(d=>{
        console.log(d.json());
      this.subscribedEvents=this.subscribedEvents.concat(d.json());
      // console.log(this.subscribedEvents);
      // console.log(this.subscribedEvents.length);
      for(let i=this.subscribedEvents.length-1;i>=0;i--){
        // console.log('running for '+i);
        // console.log(this.subscribedEvents[i]);
        // console.log(this.subscribedEvents[i]);
        if(this.subscribedEvents[i].creator._id === this._config.USER_ID){
          // console.log('removing element ');
          this.subscribedEvents.splice(i,1);
        }
      }
      // this.subscribedEvents=this.subscribedEvents.concat(d.json());
      // console.log(this.subscribedEvents);
    })
    .catch(ep=>{
      console.log(ep);
    })
  }

  showEvent(e){
    console.log('show event');
    this.navController.push(EventPage, {event: e});
  }
  editEvent(e){
    console.log('edit event');
    this.navController.push(CreateEventPage,{type:'edit',event: e});
  }

  // invite(e){
  //
  //   console.log('inviting tab..');
  //   console.log(e);
  //   this.navController.push(InvitePage,{fromPage: "fromAccount", event: e})
  // }

}
