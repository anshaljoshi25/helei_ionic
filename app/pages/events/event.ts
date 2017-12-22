import {Component, ViewChild} from '@angular/core';
import {Alert, NavController, NavParams, Slides, Popover, Platform, ActionSheet, Loading} from 'ionic-angular';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';
import {InvitePage} from '../invite/invite';
import {CreateEventPage} from '../eventcreate/eventcreate';
import {SocialSharing, LaunchNavigator} from 'ionic-native';
import {MapService} from '../../commonservices/mapservice';

@Component({
  templateUrl: `build/pages/events/description_popover.html`
})
export class DescriptionPopOver{

  _description;
  _navParams;

  constructor(navParams: NavParams){
    this._navParams = navParams;
    this._description = this._navParams.get('description');
  }
}
@Component({
  templateUrl: `build/pages/events/attending_popover.html`
})
export class AttendingPopOver{

  _event;
  _users= [];
  _navParams;

  constructor(navParams: NavParams, private _nav: NavController){
    this._navParams = navParams;
    this._event = this._navParams.get("event");
    this._users = this._event.going;
    console.log(this._users[0]);
  }
  pushPage(pg) {
    if(pg=='invite') {
      this._nav.push(InvitePage)
    }
  }

}

@Component({
  templateUrl: 'build/pages/events/event.html',
  providers:[ConfigurationService, EventsFetcherService, MapService]
})
export class EventPage {


  _nav;
  _navParams: NavParams;
  _ev;
  location='';
  _config;
  _subscribedByMe;
  _slider={};
  mySlideOptions = {
    initialSlide: 1,
    loop: true
   };
   _gmap;
  //  @ViewChild('mySlider') slider: Slides;
  constructor(private platform: Platform, nav:NavController, navParams: NavParams, private config: ConfigurationService, private _eventsFetcher: EventsFetcherService, gmap:MapService) {
      this._nav = nav;
      this._navParams=navParams;
      this._config = config.getConfig() || {};
      this._ev = this._navParams.data.event;
      this._gmap = gmap;

      if(this._ev==undefined || this._ev==null || this._ev===null || this._ev==="" || this._ev===undefined){
        this._ev={};
        this._ev.images=[];
        this._ev.categories=[];
        this._ev.going=[];
        this._ev.place= {name: 'Not Provided'};
      }

      console.log(this._ev);
      //hack for deeplink

        this.platform.ready().then(()=>{

          var _this_ = this;
          _this_.config.init().then(d=>{
            _this_._config=_this_.config.getConfig();

            if(this._ev._id==undefined || this._ev._id==null || this._ev._id===null || this._ev._id==="" || this._ev._id===undefined){

            if(_this_._navParams.get('eid')!==undefined) {
              var eid = _this_._navParams.get('eid') ;
              console.log(eid);
              var __this_ = _this_;
              _this_._eventsFetcher.post("/api/v2/events/show",{id:eid}).then(d=>{
                console.log(d.json());
                __this_._ev = d.json();
                console.log(__this_._ev);

              },e=>{
                console.log("Error: " + JSON.stringify(e));
              });
            }
          }

          },e=>{
            console.log(JSON.stringify(e));
          });
          // setTimeout(function(){

          // },500);

        });




  }

  showMap(event){
    console.log(event);
    console.log(LaunchNavigator);
    let loading = Loading.create({
        content: "Please wait...",
        duration: 3000
      });
      this._nav.present(loading);

    var startPoint=""+event.location.coordinates[1]+" , "+event.location.coordinates[0]+"";
    console.log(startPoint);
    this.currLoc().then(d=>{
      loading.dismiss();
      LaunchNavigator.navigate([d.lat(), d.lng()],[event.location.coordinates[1],event.location.coordinates[0]])
      .then(
        success => console.log("Launched navigator"),
        error => console.log("Error launching navigator", error)
      );
    }).catch(e=>{
      console.log(e);
        loading.dismiss();
    });
  }
  currLoc(){
    console.log('fetching current location');
    return  new Promise((res,rej)=>{
        this._gmap.currentLocation().then(d=>{
          res(d);
      }).catch(e=>{
          console.log(e);
          rej(e);
        });
    })
  }
  shareOptions(event){
    console.log(event);
    let txt = "Hi there! I am using Helei app to visit the event : ";
    let image = '';
    let url = ""+this._config.SERVER_URI+'/v2/event/'+event._id+". Join me there!";
    console.log(url);
    console.log('loading actionSheet');
    let actionSheet = ActionSheet.create({
      title: 'Share Event On',
      buttons: [
        {
          text: 'Facebook',
          // role: 'destructive',
          icon: !this.platform.is('ios') ? 'logo-facebook' : 'logo-facebook',
          handler: () => {
            console.log('Facebook clicked');
            SocialSharing.shareViaFacebook(txt,image, url, function() {
              console.log('share ok');
            }, function(errormsg){
              console.log(errormsg);
            });

          }
        },
        {
          text: 'WhatsApp',
          icon: !this.platform.is('ios') ? 'logo-whatsapp' : 'logo-whatsapp',
          handler: () => {
            console.log('WhatsApp clicked');
            SocialSharing.shareViaWhatsApp(txt,image, url, function() {
              console.log('share ok');
            }, function(errormsg){
              console.log(errormsg);
            });
          }
        },
        {
          text: 'Twitter',
          icon: !this.platform.is('ios') ? 'logo-twitter' : 'logo-twitter',
          handler: () => {
            console.log('Twitter clicked');
            SocialSharing.shareViaTwitter(txt,image, url, function() {
              console.log('share ok');
            }, function(errormsg){
              console.log(errormsg);
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: !this.platform.is('ios') ? 'close' : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    this._nav.present(actionSheet);
  }


  parse2Int(val) {
    return parseInt(val);
  }


  getFormattedDate(dt) {
    if(dt==undefined) return new Date();
    return new Date(dt);
  }


  pushPage(pg) {
    if(pg=="invite"){
      this._nav.push(InvitePage, {fromPage: "fromEvent", event: this._ev});
    }
    else if(pg=="edit"){
      this._nav.push(CreateEventPage,{type:'edit',event: this._ev});
    }
  }

  isLoved(e) {
    if(e==undefined || e.lovedBy==undefined) return false;
    for(let i of e.lovedBy) {
      if(i+""==this._config.USER_ID) {
        return true;
      }
    }
    return false;
  }

  love(e) {
    if(e.lovedBy==undefined) e.lovedBy=[];
    this._eventsFetcher.post("/api/v2/events/love",{id:e._id,user:this._config.PHONE_NUMBER}).then(d=>{
      for(var i=0;i<(e.lovedBy.length);i++) {
        var ii = e.lovedBy[i];
        if(ii+""==this._config.USER_ID) {
          e.lovedBy.splice(i,1);
          return;
        }
      }
      e.lovedBy.push(this._config.USER_ID);
    },e=>{
      console.log(e);
    });
  };

  isAttended(e){
    if(e==undefined || e==null || e=="") return false;
    for(let i of e.going) {
      if(i+""==this._config.USER_ID) {
        return true;
      }
    }
    return false;
  }
  attendEvent(e){
    //if user already attends this event.

    if(this.isAttended(e)){
      console.log("Event Unatted button clicked");
      let confirm = Alert.create({
        title:'Unattend Event: ', message:'Do you really not want to go to this event?',
        buttons: [
          {
            text: 'Cancel',
            handler:()=>{
            }
          },{
            text: 'Unattend',
            handler:()=>{

              for (let ie of e.going) {

                if (ie+"" == this._config.USER_ID && this._config.USER_ID != undefined) {
                  this._eventsFetcher.post("/api/v2/events/accepted/decline",{event: e, uid: this._config.USER_ID}).then(d=>{
                  e.going.splice(e.going.indexOf(ie+""), 1);
                }, e=> {console.log(e)
                });
                  return;
                }
              }
            }
          }
        ]
      });
      this._nav.present(confirm);
    }
    //Othereise attend.
    else{
      this._eventsFetcher.post("/api/v2/events/invites/accept/",{event: e, uid: this._config.USER_ID}).then(d=>{
      this._subscribedByMe = true;
      e.going.push(this._config.USER_ID);
    }, e=> {console.log(e)
    });
    console.log("Event Attend button clicked");
  }
}

showDescription(e){
  let popover = Popover.create(DescriptionPopOver, {description: e.description});
    this._nav.present(popover);
}
showAttending(e){
  let popover = Popover.create(AttendingPopOver, {event: e});
  this._nav.present(popover);
}

}
