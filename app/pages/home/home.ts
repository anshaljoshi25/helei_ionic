import {Component} from "@angular/core";
import {Alert, NavController, NavParams, Platform, ViewController, Modal, Loading,ActionSheet, Popover, MenuController} from 'ionic-angular';
import {AskphonePage} from '../askphone/askphone';
import {EventPage} from '../events/event';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';
import {Geolocation, Toast, LaunchNavigator} from 'ionic-native';
import {Diagnostic, SocialSharing} from 'ionic-native';
import {CreateEventPage} from '../eventcreate/eventcreate';
import {SearchPage} from '../search/search';
import {AttendingPopOver} from '../events/event'
import {MapService} from '../../commonservices/mapservice';
@Component({
  templateUrl: 'build/pages/home/home.html',
  providers:[ConfigurationService, EventsFetcherService, MapService]
})
export class HomePage {
  _eventsFetcher:EventsFetcherService;
  _events = [];
  _config;
  _event;
  _filters;
  _login;
  filtersData;
  place;
  comingFromFilters = false;
  _tmpEvent;
  _ios = false;
  backPressed=false;
  _gmap;
  locationTxt;
  listPlaces;
  searchedPlace;
  ionViewDidEnter() {
    // console.log(this._pagination);
    // if(this._tmpEvent!==undefined && this._pagination.pg<=0){
    //   this._tmpEvent.enable(true);
    // }
  }
  _pagination = {pg:0,limit:10};
  constructor(private _navController: NavController,private menu: MenuController, private _navParams: NavParams, private platform: Platform,private config: ConfigurationService, eventsFetcher: EventsFetcherService, gmap:MapService) {

    this.filtersData = {
      sort: 'distance',
      forDays: 30,
      categories:[0]
    };
    let _this_=this;



    platform.ready().then((rs)=>{
      //check if ios
      this._ios =  platform.is('ios');
      config.init().then((config)=>{
        //initialization done
        this._config = config;
        this._eventsFetcher = eventsFetcher;
        this._gmap = gmap;
        //check if registered?
        var ph = this._config.PHONE_NUMBER;
        if(ph===undefined || ph==="" || ph===null) {
          this._login= Modal.create(AskphonePage, {status:"NOT_LOGGED_IN"});
          this.menu.swipeEnable(false);
          this.enableBack(false);
          this._login.onDismiss(data=>{
            _this_.config.init().then(d=>{
              _this_._config = d;
              // _this_.loadMoreEvents();
              _this_.menu.swipeEnable(true);
              _this_.enableBack(true);
              _this_.enableLocationService();
            },e=>{
              console.log(e);
            });

          });
          this._navController.present(this._login);
        } else {
        _this_.enableLocationService();
        }

      })
      .catch ((e) => {
        console.log("Error_Home"+e);
      });
    })
    .catch((e)=>{
      console.log("Platform could not  be initialized!");
    });
  }

  ngAfterViewInit() {
    console.log('home page  init');
    if(this.platform.is('android') || this.platform.is('ios')){
      if(navigator.splashscreen)
        navigator.splashscreen.hide();
    }

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
      this._navController.present(actionSheet);
    }

  showMap(event){
    let loading = Loading.create({
      content: "Please wait...",
      duration: 3000
    });
    this._navController.present(loading);
    console.log(event);
    console.log(LaunchNavigator);
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

  refresh(){
    console.log('refreshing home page');
    if(this.searchedPlace === ''){
      return;
    }
    this.filtersData.place = this.searchedPlace;
    this._events=[];
    this._pagination.pg=0;
    this.loadMoreEvents();
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
  getPlaceName(latLng){
    console.log('fetching location name');
    return new Promise ((res,rej)=>{
      this._gmap.getPlaceBylatLng(latLng).then(d=>{
        res(d);
    }).catch(e=>{
        console.log(e);
        rej(e);
      });
    })
  }
  fetchCurrentLoc(){
    let locationInp = (<HTMLInputElement>(document.getElementById("location").getElementsByTagName('input')[0]));
    let loading = Loading.create({
      content: "Please wait...",
      duration: 3000
    });
    this._navController.present(loading);
    var _this = this;
    this.listPlaces=[];
    _this.currLoc().then(d=>{
      console.log(d.lat());
      console.log(d.lng());
      _this.getPlaceName(d).then(d=>{
        console.log('place found');
        console.log(d);
        locationInp.value=d.results[5].formatted_address;
        _this.locationTxt=d.results[5].formatted_address;
        _this.filtersData.place=d.results[5];
        _this._events=[];
        _this._pagination.pg=0;
        _this.loadMoreEvents();
          loading.dismiss();
      }).catch(e=>{
          console.log(e);
            loading.dismiss();
        });
    }).catch(e=>{
        console.log(e);
          loading.dismiss();
      });
    }

    searchPlace(place){
      this.listPlaces=[];
      if(place.target.value.trim() == ''){
        console.log('empty values');
        return;
      }else{
        //console.log(place.target.value.toLowerCase());
        this._gmap.getPlaceByString(place.target.value.toLowerCase()).then((places)=>{
          places.results
          .forEach(({formatted_address,geometry})=>(this.listPlaces.push({'name':formatted_address,geometry:{location:{lat:geometry.location.lat,lng:geometry.location.lng}}})));
            // console.log(this.listPlaces);
        })
      }

    }
    selectPlace(place){
      console.log(place);
      this.listPlaces=[];
      this.locationTxt=place.name;
      this.filtersData.place=place;
      this._events=[];
      this._pagination.pg=0;
      this.loadMoreEvents();
    }
  enableBack(flag) {
    var _this_ = this;
    if(!flag){
    _this_.platform.backButton.subscribe(() => {
            _this_.menu.close();
            _this_._navController.setRoot(AskphonePage);


            if (! this.backPressed) {
                _this_.backPressed = true

                _this_.showToast('Press again to exit', 2000);

                setTimeout(() => _this_.backPressed = false, 2000)

                return;
            }

            _this_.platform.exitApp();
        }, error => _this_.showToast("Error while disabling back nav!",2000));
      } else {
        _this_._navController.setRoot(HomePage);
        for(let i=0;i<_this_._navController.length();i++) {
          _this_._navController.remove(i);
        }
      }
  }

  showToast(msg,time) {
    Toast.show(msg,time,"bottom");
  }

  enableLocationService() {
    //checks if any location services are available to get location
    var _this_ = this;
    let isLocEnabled = Diagnostic.isLocationEnabled().then(function(enabled) {
      if(!enabled){
      let gpsDisabled = Alert.create({
        title:'Looks like your GPS is turned off: ', subTitle:'If you would like to see events near you, turn it on,',
        buttons: ["ok"]
      });
      _this_._navController.present(gpsDisabled);
    }
    }, function(error) {
        console.log(error);
    });
    let locationInp = (<HTMLInputElement>(document.getElementById("location").getElementsByTagName('input')[0]));
    //get current location
    console.log(locationInp);
    let geocoder = new google.maps.Geocoder();
    Geolocation.getCurrentPosition().then((resp)=>{
      var latlng = {lat: resp.coords.latitude, lng: resp.coords.longitude};
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results!=undefined && results.length) {
            let finalPlace = results.length>1?results[results.length-2]:results[1];
            locationInp.value=(finalPlace.formatted_address);
            _this_.searchedPlace=finalPlace;
            _this_.filtersData.place=finalPlace;
            _this_._events=[];
            _this_._pagination.pg=0;
            _this_.loadMoreEvents();
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });
    }).catch((err)=>{
      console.log(err);
    });

    let autocomplete = new google.maps.places.Autocomplete(locationInp,{types:[]});
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        _this_.place = autocomplete.getPlace();
        _this_.searchedPlace=autocomplete.getPlace();
        _this_.filtersData.place = _this_.place;
        _this_._events=[];
        _this_._pagination.pg=0;
        _this_.loadMoreEvents();
      }
    );
  }

  doInfinite(event) {
    // if(this._tmpEvent!==undefined) {
    //   if(this._pagination.pg<=0) {
    //     this._tmpEvent
    //   }
    // }
    this._tmpEvent = event;
    this.loadMoreEvents().then(d=>{
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

  loadMoreEvents() {
    let loading = Loading.create({
      content: "Please wait...",
      duration: 3000
    });
    this._navController.present(loading);
    return new Promise((resolve,reject)=>{

      this._eventsFetcher.getEvents(this._pagination.pg,this._pagination.limit,this.filtersData).then((d)=>{
        this._events = this._events.concat(d.json());

        if(d.json()!==null && d.json()!=undefined && d.json().length) {

          resolve(true);
        } else {
          resolve(false);
        }
        this._pagination.pg+=1;
        loading.dismiss();
      }).catch(e=>{console.log("errorlme"+e);
      reject(e);
    });

    });

  }

  showEvent(event){
    this._event=event;
    // console.log('show event');
    // console.log(this._event);
    this._navController.push(EventPage, {event: this._event});
  }

  createEvent(type){

  }

  showFilters() {
    this.listPlaces=[];
    this._filters= Modal.create(FiltersModal, {filtersData:this.filtersData, config: this._config});
    this._filters.onDismiss(data=>{
      this.comingFromFilters=true;
      if(data.status!==undefined && data.status!==null && data.status!=="" && typeof data.status===typeof "CLOSED"){
        //noop
        console.log("filters not applied");
      } else {
        this.filtersData = data;
        //now fetch the new events
        //first set the page to 0
        this._pagination.pg=0;
        if(this._tmpEvent!==undefined) {
          this._tmpEvent.enable(true);
        }
        this._events=[];
        this.loadMoreEvents();
      }
    });
    this._navController.present(this._filters);
  }


  pushPage(pg,opts){
    if(pg==='create')
      this._navController.push(CreateEventPage,opts);
    else if(pg==="search")
      this._navController.push(SearchPage,opts);
    }

  isLoved(e) {
    if(e.lovedBy==undefined) return false;
    for(let i of e.lovedBy) {
      if(i+""==this._config.USER_ID) {
        return true;
      }
    }
    return false;
  }

  parse2Int(val) {
    return parseInt(val);
  }

  love(e) {
    if(e.lovedBy==undefined) e.lovedBy=[];
    this._eventsFetcher.post("/api/v2/events/love",{id:e._id,user:this._config.PHONE_NUMBER}).then(d=>{
      for(var i=0;i<e.lovedBy.length;i++) {
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
  }

  showAttending(e)
  {
    let popover = Popover.create(AttendingPopOver, {event: e}, {showBackdrop: true, enableBackdropDismiss: true});
    this._navController.present(popover);
  }

}


@Component({
  templateUrl: 'build/pages/home/filters.html',
  providers: [EventsFetcherService, ConfigurationService]
})
export class FiltersModal {

  _filters;
  _categories;
  _config;
  constructor(private _view: ViewController, private _navParams: NavParams,private _eventsFetcher: EventsFetcherService) {

    this._categories=[];
    this._filters = _navParams.get("filtersData");
    this._config = _navParams.get("config");
    this._eventsFetcher.getCategoriesByConfig(this._config).then(d=>{
      this._categories = this._categories.concat(d.json());
      console.log(this._categories);
    }).catch(e=>{
      console.log("Unable to fetch categories" + e);
    });
  }

  selectCat(e) {
    console.log(this._filters.categories);
    for(let i of this._filters.categories) {
      if(i==="0") {
        this._filters.categories=[0];
        return;
      }
    }

  }

  dismiss(applyFlag) {
    if(applyFlag)
      this._view.dismiss(this._filters);
    else
      this._view.dismiss({status:'CLOSE'});
    };


  }
