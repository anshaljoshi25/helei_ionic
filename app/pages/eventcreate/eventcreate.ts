import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Platform, Alert, Loading, Toast,Modal, ModalController, ViewController, MenuController} from 'ionic-angular';
import {DatePicker} from 'ionic-native';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';
import {CameraService} from '../../commonservices/cameraservice';
import {CategoryFetcherService} from '../../commonservices/categoryfetcherservice';
import {MapService} from '../../commonservices/mapservice';
import {InvitePage} from '../invite/invite';
import {AttendingTab} from '../attending/attending';
import {AccountPage} from '../account/account';
import {Http, Headers, RequestOptions} from '@angular/http';
/// <reference path="google.maps.d.ts" />

@Component({
  templateUrl: 'build/pages/eventcreate/eventcreate.html',
  providers:[ConfigurationService, EventsFetcherService, CategoryFetcherService, CameraService, MapService]
})

export class CreateEventPage {
  @ViewChild('mapCanvas') mapCanvas;
  // cropped image and orginalImage is the one from cam
  cropedImage: string;
  originalImage:string;

  // counter for the tab
  tabCurrent=1;

  // map object & gmap service obj
  map={};
  gmap:any;
  mapOptions = {
    zoom: 15,
    minZoom:12,
    maxZoom:18,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI:true,
    center:null
  }
  mapDrag=false;
  // platform object ; camera object _cat: category service object holder; campOptions: options for camera
  // evetn object.
  platform:any;
  camera:any;
  _cat:any;
  camOptions={};
  eventFetcher:any;
  event={
    name:'demo',
    description:'demo',
    repeat:false,
    inviteall:false,
    eventStartDate:'',
    eventEndDate:'',
    location:{},
    venueName:'',
    eventDisplayPic:'',
    category:'',
    categories:[],
    place:{},
    going:'',
    creator:'',
    selectedOpts:'',
    public:false,
    invites:[],
    going:[],
    user:{},
    type:'Create',
    deals:[]
  };
  _ev={

  };
  message='Hey!! I am hosting an event"'+this.event.name+'" at '
          +this.location+'.. Dont forget to join me in the event \n \n'
          +'Visit '+this.event.link+' to subscribe!!';
  inviteall=true;

  // categories fetched from server; searched category and serached input
  categories:any;
  scategories:any;
  searchInput1:any;
  selectedCategories:any;
  categoryLimit:any;

  // search place on map or show string from the marker
  searchInput2:any;
  listPlaces:any;

  //
  marker:any;
  fileTransfer:any;
  nav:any;
  config:any;
  loading:any;
  toast:any;
  showLoadPrevBtn=false;
  camUsed=false;
  minStartDate:any;
  maxStartDate:any;
  minEndDate:any;
  maxEndDate:any;
  clickedSubmit:any;
  deal={
    name:'',
    description:'deal text',
    startDate:'',
    endDate:''
  };
  modalCtrl:any;
  constructor(platform: Platform, nav:NavController, navParams: NavParams,
    config: ConfigurationService,cat: CategoryFetcherService, camera: CameraService, gmap:MapService, eventFetcher:EventsFetcherService){

    console.log('here in create page');
    this.listPlaces=[];
    this.categories=[];
    this.scategories=[];
    this.selectedCategories=[];
    this.event.eventStartDate = new Date().toISOString();
    this.event.eventEndDate = new Date();
    this.event.eventEndDate.setDate(this.event.eventEndDate.getDate()+1);
    this.event.eventEndDate =this.event.eventEndDate.toISOString();
    // this.modalCtrl=modalCtrl;
    this.nav=nav;
    this.platform=platform;
    this.navParams = navParams;
    this._cat=cat;
    config.init().then((config)=>{
      this.config=config;
      this.checkType();
    })
    .catch ((e) => {
      console.log("Error_Home"+e);
    });

    this.eventFetcher = eventFetcher;
    this.camera=camera;

    this.gmap=gmap;
    this.map=false;





    if(navigator.camera){
      //console.log('camera exists');
      this.camOptions = {
          quality : 75,
          destinationType : navigator.camera.DestinationType.FILE_URI,
          sourceType : navigator.camera.PictureSourceType.CAMERA,
          // allowEdit : true,
          encodingType: navigator.camera.EncodingType.JPEG,
          // targetWidth: 300,
          // targetHeight: 300,
          saveToPhotoAlbum: true,
          popoverOptions: CameraPopoverOptions,
          correctOrientation: true
      }
    }
    else{

      this.camOptions={};
    }

    this.categoryLimit=3;
    this.searchInput1='';
    this.searchInput2='';


    this.minStartDate=new Date().toISOString().substring(0, 10);
    this.maxStartDate=new Date();
    this.maxStartDate.setFullYear(this.maxStartDate.getFullYear()+1);
    this.maxStartDate=this.maxStartDate.toISOString().substring(0, 10);

    this.minEndDate=this.minStartDate;
    this.maxEndDate=this.maxStartDate;

    this.clickedSubmit=false;


  }
  // check type of incoming either its called for editing an event or creating new.
  checkType(){
    if(this.navParams.data.type === 'edit'){
      this._ev = this.navParams.data.event;
      this._ev.type = 'Edit';
      this.event = this._ev;
      this.event.eventStartDate = this._ev.eventStartDate;
      this.event.eventEndDate = this._ev.eventEndDate;
      this.originalImage=this.config.SERVER_URI+this._ev.eventDisplayPic.substr(1);
      this.cropedImage=this.config.SERVER_URI+this._ev.eventDisplayPic.substr(1);
      this.selectedCategories=[];
      this.event.location.value=true;

      // this.selectedCategories=this.event.categories;
    }else{
      this.event.location.value=false;
      this.event.user._id='';
      this.event.place.name='';
      this.event.place.geometry={};
      this.event.place.geometry.location={};
      this.cropedImage = "";
      this.originalImage = "";
      this.selectedCategories=[];
    }

  }
// on screen utility
  showLoading(txt) {
    console.log('show loading');
    this.loading = Loading.create({
      content: txt
      // ,duration: 3000
    });
    this.nav.present(this.loading);
  }

  dismissLoading(){
    console.log('dismising loading');
    this.loading.dismiss();
  }

  showToast(txt){
    //console.log('shwoing toast');
    this.toast = Toast.create({
      message:txt,
      showCloseButton: true,
      position:'bottom',
      duration:1500
    });
    this.nav.present(this.toast);
  }

  hideToast(){
    this.toast.dismiss();
  }

//  use previous image if loaded
  usePrevImage(){
    //console.log('use previous image');
    this.selectedCategories=[];
    this.loadCategory();
    this.nextTab();
  }

  // method for uploading clicked image to server by using cordova plugin
  uploadEventImage(){
    if(!this.camUsed){
      //console.log('cannot upload image from server to server without saving locally: click new');
      return new Promise((res,rej)=>{
        res();
      });
    }
    else{


    this.fileTransfer= new FileTransfer();
    // var fileURL = this.event.type==='Edit'?this.event.eventDisplayPic:this.cropedImage;
    var fileURL =this.cropedImage;

    var options = new FileUploadOptions();
    options.fileKey = "eventDisplayPic";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.httpMethod = 'POST';

    // var ft = new FileTransfer();
    //console.log('print file options');
    //console.log(fileURL);
    //console.log(options);
    //console.log(this.config.SERVER_URI +"/api/events/create/upload");
    var self= this;
    return new Promise((res,rej)=>{
      this.fileTransfer.upload(fileURL, encodeURI(this.config.SERVER_URI +"/api/events/create/upload")
      , function(success){
        let uploadedPath=JSON.parse(success.response);
        //console.log(uploadedPath);
        //console.log(uploadedPath.path);
        self.event.eventDisplayPic=uploadedPath.path;
        res()
  		}, function(error) {
  			//console.log("error", error);
        rej();
  		}, options);
    });
  }
  }

  // search utility for category
  searchCategory(search){
    //console.log('in search method');
    // //console.log(search.target.value);
    // //console.log(this.categories);
    // this.scategories=this.categories;
    if(search.target.value.trim() == ''){
      //console.log('empty values');
      this.scategories=this.categories;
      return;
    }

    this.scategories = this.scategories.filter((val)=>{
      //console.log('inside filter');
      if(val.name.toLowerCase().indexOf(search.target.value.toLowerCase())>-1){
        return true;
      }
      return false;
    })
  }

  // load categories from server uisng service
  loadCategory(){
    // console.log('loading categories');
    this._cat.get('/api/categories',{}).then(categories=>{

      this.categories=categories;
      this.scategories=categories;
      //console.log(categories);
      //console.log('removing categories');
      //console.log(this.event.categories);
      if(this.event.type==='Edit'){
        for(let i =0;i < this.event.categories.length;i++){
          // console.log('selecting category '+  this.event.categories[i].name);
          this.removePreloadedCategory(this.event.categories[i]);
          // this.removePreloadedCategory(this.event.categories[i]);
        }
      }

    }).catch(err=>{
      console.log('Error getting categories from server: '+err);
      this.showToast('Connection failed. Please try again later..');
    });
  }

  // selected category
  selectCategory(cat){
    this.searchInput1='';
    this.event.category=cat._id;
    // this.scategories=[];
    // this.scategories.push(cat);
    if((this.selectedCategories.length)<3){
      this.selectedCategories.push(cat);
      for(let c =0;c < this.scategories.length;c++){
        // //console.log('in for loop');
        if(this.scategories[c]._id === cat._id){
          // //console.log(this.scategories[c]._id);
          this.scategories.splice(c,1);
          this.event.categories=this.selectedCategories;
        }
      }
    }else{
      //console.log('limit exceeded');
    }
  }

  removeSelCategory(sCat){
    // //console.log(sCat);
    for(let c =0;c< this.selectedCategories.length;c++){
      if(this.selectedCategories[c]._id === sCat._id){
        this.selectedCategories.splice(c,1);
        this.scategories.push(sCat);
        this.event.categories=this.selectedCategories;
      }
    }

  }

  // remove preloaded categories in cas its edit event
  removePreloadedCategory(sCat){

      this.searchInput1='';
      // this.scategories=[];
      // this.scategories.push(cat);

        this.selectedCategories.push(sCat);
        for(let c =0;c < this.scategories.length;c++){
          // //console.log('in for loop');
          if(this.scategories[c]._id === sCat._id){
            // //console.log(this.scategories[c].name);
            this.scategories.splice(c,1);
            // this.event.categories=this.selectedCategories;
          }
        }



  }

  // if user presses cancel button on category search
  onCatSearchCancel(cancel){
    //console.log('cancel btn pressed');
    this.scategories=this.categories;
  }

  // crop image available in orignalImage var
  // TODo: fixed the hardcoded uri for android
  cropImage(){

    if(!this.camUsed){
      //console.log('cannot edit image from server: click new');
      return;
    }
    if(this.platform.is('android')){
      (this.originalImage.indexOf('file:///') > -1)?'':(this.originalImage='file:///'+this.originalImage);
    }
    this.showLoading('Loading image to crop');

    this.camera.cropPicture(this.originalImage).then(newImageData=>{
      this.cropedImage = newImageData;

      this.dismissLoading();
    }).catch((error)=>{
      console.log('Error cropping picture'+error);
        this.dismissLoading();
    });

  }

// camera action for taking picture
  camAction(){
    this.loadCategory();
    // //console.log(this.camOptions);
    this.showLoading('Loading...');
    this.camera.getPicture(this.camOptions).then(imageData=>{
      this.cropedImage = imageData;
      this.originalImage = imageData;
      this.camUsed=true;
      this.selectedCategories=[];
      // this.loadCategory();
      this.nextTab();
      this.dismissLoading();
    }).catch((error)=>{
      //console.log("ERROR taking picture-> " + JSON.stringify(error));
        this.dismissLoading();
    })
  }

// method to take picture by setting the source type to camera
  takePicture(){
    this.camOptions.sourceType=navigator.camera.PictureSourceType.CAMERA;
    this.camAction();
  }

// method to take pictue from gallery by setting the source type to library
  openGallery(){
    // console.log(navigator.camera);
    // for development purposee to go to next slide on browsers
    if(navigator.camera===undefined){
      this.selectedCategories=[];
      this.loadCategory();
      this.originalImage='testimage.jpg';
      this.nextTab();
      // this.dismissLoading();

      return;
    }else{
      this.camOptions.sourceType=navigator.camera.PictureSourceType.PHOTOLIBRARY;
      this.camAction();
    }

    // this.nextTab();
  }

  // sets flag for loading map only when html element is rendered on front end
  loadMapElePromise(){
    return new Promise((res,rej)=>{
      //console.log(document.getElementById('map-canvas'));
      setTimeout(function(){
        if(document.getElementById('map-canvas')){res()}
        else{rej()}}, 100);
    });
  }

// search place
  searchPlace(place){
    this.listPlaces=[];
    if(place.target.value.trim() == ''){
      //console.log('empty values');
      return;
    }else{
      //console.log(place.target.value.toLowerCase());
      this.gmap.getPlaceByString(place.target.value.toLowerCase()).then((places)=>{
        // //console.log(places);
        places.results
        .forEach(({formatted_address,geometry})=>(this.listPlaces.push({'name':formatted_address,'lat':geometry.location.lat,'lng':geometry.location.lng})));
        // .forEach(({formatted_address,geometry})=>(//console.log(formatted_address+' location at -> '+geometry.location.lat +' '+geometry.location.lng)));
        // //console.log(this.listPlaces);
      })
    }

  }

// if user select a place from list
  selectPlace(place){
    //console.log('selected place from search bar');
    this.mapDrag=true;
    //console.log(place);
    // this.event.place=place;

    this.saveLocation(place.lat,place.lng);
    this.event.place.name=place.name;
    this.event.place.geometry.location.lng=place.lng;
    this.event.place.geometry.location.lat=place.lat;
    this.gmap.updateMapBylatLng(place.lat,place.lng);
    this.gmap.updateMarker(this.marker,{latLng:this.map.getCenter(),draggable:true});
    this.searchInput2 = place.name;
    this.listPlaces = []

  }
  // what happens if user drags the map
  onMapDrag(ms){
    this.listPlaces=[];
    this.mapDrag=true;
    //console.log('map dragged');
    //console.log(this.marker.position);
    ms.updateMarker(this.marker,{latLng:this.map.getCenter(),draggable:true});
    ms.getPlaceBylatLng(this.map.getCenter()).then((place)=>{
      //console.log('updating search txt field');
      this.searchInput2 = place.results[0].formatted_address;
      this.saveLocation(this.map.getCenter().lat(),this.map.getCenter().lng());
      // this.event.place=this.searchInput2;
      this.event.place.name=this.searchInput2;
      this.event.place.geometry.location.lng=this.map.getCenter().lng();
      this.event.place.geometry.location.lat=this.map.getCenter().lat();
    });
  }

// loads the map from api with custom options
  loadMap(){
    //console.log('loading map');

    if(this.event.location.value){
      //console.log('map has data');
      // //console.log(this.map.getCenter());
      //console.log(this.event.place.geometry.location.lat);
      if(this.event.type==='Edit'){
        console.log('showing map with loaded db data');
        this.mapOptions.center=new google.maps.LatLng(this.event.place.geometry.location.lat,this.event.place.geometry.location.lng);
        //console.log(this.mapOptions);
      }
      else{
        console.log('showing map with loaded local data');
        this.mapOptions.center=new google.maps.LatLng(this.map.getCenter().lat(),this.map.getCenter().lng());
        //console.log(this.mapOptions);
      }

    }
    this.gmap.init(document.getElementById('map-canvas'),this.mapOptions)
    .then((_map)=>{
      this.map = _map
      this.marker = this.gmap.addMarker({latLng:_map.getCenter(),draggable:true});

      this.gmap.getPlaceBylatLng(this.map.getCenter()).then((place)=>{
        this.searchInput2 = place.results[0].formatted_address;
        // this.event.place=this.searchInput2;
        this.event.place.name=this.searchInput2;
        this.event.place.geometry.location.lng=this.map.getCenter().lng();
        this.event.place.geometry.location.lat=this.map.getCenter().lat();
      });

      // me : instance of this class to gmap method so we can call local method later on
      var me = this;
      this.gmap.on('dragend',function(){
        me.onMapDrag(this);
      });
      this.saveLocation(_map.getCenter().lat(),_map.getCenter().lng());


    })
    .catch((m)=> {
      console.log('MAP: init failed '+m)
    });
  }

// save location for event.location field
  saveLocation(lat,lng){
    //console.log('updating location');
      this.event.location.longitude=lng;
      this.event.location.latitude=lat;
      this.event.location.value=true;
      //console.log(this.event.location);
  }

// get the current location of user
  currentLoc(){
    this.event.location.value=false;
    this.mapOptions.center=null;
    this.loadMap();
  }

  attachEventDeal(type){
    console.log(type + ' deal clicked');
    // console.log(Modal);
    // console.log(ModalsContentPage)
    let modal = Modal.create(ModalsContentPage,{'actionType':type, 'eventData':this.event,'config':this.config});
    modal.onDismiss(d => {
      console.log('reruned data from modal');
      // console.log(d);
      this.event.deals = d._id;
      console.log(this.event);
    })
    this.nav.present(modal);
    // modal.present();
    // console.log('fetching previosuly created deals for this user');
    //
    // // this.deal.name=this.event.name;
    // this.deal.startDate = this.event.eventStartDate;
    // this.deal.endDate= this.event.eventEndDate;
    //
    // console.log(this.deal);

  }
  // keep changing the tab to next if everythings good
  nextTab(){
    //console.log('on this tab -> '+ this.tabCurrent);
    if(this.tabCurrent === 4){
      this.tabCurrent=4;
      console.log('submitting event ');
      // this.showLoading('Saving event...');
      if(this.event.place.name === '' || this.event.place.geometry.location.lng === undefined){
        this.showToast('Please select the location');
        return;
      }
      this.clickedSubmit=true;
      var ld = Loading.create({
        content: 'saving event...'
        ,duration: 5000
      });
      this.nav.present(ld);
      console.log(ld);

      this.uploadEventImage()
        .then(()=>{
          console.log('uploaded image, sending data with image url');
          //console.log(this.event);
          // this.updateEventDeal();
          // /*
          if(this.event.type==='Edit'){
            // this.showLoading('Saving event...');
            console.log(ld);
            // console.log(this);
            console.log('updating event');
            this.eventFetcher.post('/api/v2/events/update',{event:this.event})
              .then(d=>{
                console.log('update event success');
                // console.log(this);
                // this.dismissLoading();
                console.log(ld);
                ld.dismiss();
                this.showToast('Event updated successfully.');
                // console.log(d.json());
                this.nav.pop();

              })
            .catch(e =>{
              console.log('Unable to update/upload event data' + e);
              //console.log(e);
              // console.log(this);
              // this.dismissLoading();
              console.log(ld);
              ld.dismiss();
              this.clickedSubmit=false;
              this.showToast('Connection failed. Please try again later..');

            });
          }
          else{
            // this.showLoading('Saving event...');
            // console.log(this);
            this.event.user._id=this.config.USER_ID;
            console.log('creating event');
              console.log(ld);
            this.eventFetcher.post('/api/v2/events/create',{event:this.event})
              .then(d=>{
                console.log('creating event success');
                // console.log(this);
                // this.dismissLoading();
                  console.log(ld);
                ld.dismiss();
                this.showToast('Event created successfully.');
                console.log(d.json());
                // this.nav.push(InvitePage, {fromPage: "fromEventCreate", event: d.json()});
                this.nav.push(AccountPage,{fromPage: "fromEventCreate"});

              })
            .catch(e =>{
              console.log('Unable to create event data' + e);
              //console.log(e);
              // console.log(this);
              // this.dismissLoading();
              console.log(ld);
              ld.dismiss();
              this.clickedSubmit=false;
              this.showToast('Connection failed. Please try again later..');

            });
          }
          // */
        })

        .catch((e)=> {
          //console.log('Unable to upload image'+e);
          // this.dismissLoading();
          console.log(ld);
          ld.dismiss();
          this.clickedSubmit=false;
          this.showToast('Error uploading image. Please try again later..');
        });
    }
    else if (this.tabCurrent === 1){
      //console.log('trying to go to next tab from take image tab');
      if((this.originalImage)!==''){
        this.tabCurrent+=1;
        // this.uploadEventImage();
      }
      else{
        //console.log('no image is selected');
        this.showToast('Please select image to continue');
        return;
      }
    }
    else if (this.tabCurrent === 2){
      console.log('trying to go to next tab from select category view');
      console.log(this.event.categories);
      if((this.event.categories.length)>0){
        this.tabCurrent+=1;
      }
      else{
        this.showToast('Please select atleast one category');
        return;
      }
    }
    else if (this.tabCurrent === 3){
      //console.log('trying to go to next tab from input details view');
      if(this.event.name !== ''&& this.eventStartDate !== '' && this.eventEndDate !== ''){
        this.tabCurrent+=1;
        this.loadMapElePromise()
        .then(()=>{
          //console.log('MAP: element promise returned');
          this.loadMap();

        })
        .catch(()=> {
          //console.log('MAP: element promise failed')
        });
      }
      else{
        this.showToast('Please provide required details for event');
        return;
      }

    }
    else{
      this.tabCurrent+=1;
      //console.log('next tab -> '+ this.tabCurrent);
    }

    //console.log(this.event);



  }

  // go back to previous tab
  prevTab(){
    //console.log('on this tab -> '+ this.tabCurrent);
    if(this.tabCurrent === 1){
      this.tabCurrent=1;
      //console.log('only go forward ');
    }
    else if (this.tabCurrent === 4){
      //console.log('going to 4 + loading map backwards');
      this.tabCurrent-=1;
      this.loadMapElePromise()
      .then(()=>{
        //console.log('promise returned');
        this.loadMap();

      })
      .catch(()=> {
        //console.log('promise failed')
      });
    }
    else{
      if(this.tabCurrent === 2){
      //console.log('going back to tab 1 with already loaded image');
      this.showLoadPrevBtn= true;
      }
      this.tabCurrent-=1;
      //console.log('prev tab -> '+ this.tabCurrent);

    }
  }

}
// /*

@Component({
  templateUrl:  'build/pages/eventcreate/deal-modal.html'
})

class ModalsContentPage {
  actionType;
  _http: Http;
  headers;
  options;
  _config;
  eventData;
  // all deals avaible for this user
  availableDeals;
  // deals already attaced to this event
  attachedDeal;
  // new deal being created
  createdDeal;
  addnew=0;
  switchTxt='Add New';
  deal = {
    name:'',
    description:'',
    type:'',
    startDate:'',
    endDate:'',
    creator:'',
    type:'prepaid'
  }
  constructor(public platform: Platform, http: Http, public params: NavParams, public viewCtrl: ViewController) {
    console.log('modal constructor');
    this._config = this.params.get('config');;
    this._http = http;
    this.headers = new Headers({
          'Content-Type':'application/json'
      });
    this.options = new RequestOptions({
        headers: this.headers
    });
    this.actionType = this.params.get('actionType');
    this.eventData = this.params.get('eventData');
    console.log(this.eventData );
    if(this.actionType === 'Attach'){
      this.fetchDeals().then((list)=>{
        console.log('returned list');
        this.availableDeals=list;
        console.log(list);
        for(let i =0;i <this.availableDeals.length;i++){
          this.availableDeals[i].enabled = false
        }
        if(this.eventData.type === 'Edit'){
          console.log('editing deals');
            this.attachedDeal=this.eventData.deals[0];
            if (this.eventData.deals.length>0){
              for(let i =0;i <this.availableDeals.length;i++){
                if(this.availableDeals[i]._id === this.attachedDeal._id){
                  this.availableDeals[i].enabled = true;
                }
              }
            }

        }
        else{
          this.attachedDeal = [];
        }

        // this.availableDeals[0].enabled = true;
      })
      .catch((e)=>{
        console.log('error' + e);
      })
    }

  }

  addDeal(){
    if(this.addnew == 0){
      this.addnew = 1;
      this.switchTxt = 'Cancel';
    }
    else{
      this.addnew = 0;
      this.switchTxt = 'Add New';
    }

  }

  createDeal(){
    console.log(this.deal);
    this.deal.creator=this._config.USER_ID;
    var self = this;
    return new Promise ((res,rej)=>{
      self._http.post(self._config.SERVER_URI + '/api/v2/deals/create',JSON.stringify({'deal':self.deal}),self.options)
      .subscribe(d => {
          res(d);
      }, e => {
        console.log("Deal creation : Unable to do http post!" + e);
        rej(e);
      });
    });
  }
  applyDeals(){
    console.log(this.addnew);
    if(this.addnew == 0){
      console.log('attaching deals ');
      console.log(this.attachedDeal);
      this.dismiss(true);
    }
    else if (this.addnew == 1){
      console.log('creating and attaching deals ');
      this.createDeal().then(d=>{
        console.log('deal created!')
        console.log(d.json());
        this.attachedDeal = d.json();
        this.dismiss(true)
      })
      .catch((e)=>{
        console.log('error occured '+ e);
      })
    }
  }
  isAttached(deal){
    console.log('checking is deal is attached or not');
    for(let i =0;i < this.attachedDeals.length;i++){
      if(this.attachedDeals[i]._id === deal._id){
        deal.enabled = true;
        return true;
      }else{
        deal.enabled = false;
        return false;
      }
    }
    // return false;
  }
  changeBool(status,event,deal){
    console.log(status);
    console.log(event.checked);
    if(status === 'DEAL_CHANGED'){
      if(event.checked === true){
        console.log('deal enabled');
        // this.addDeal(deal);
        for(let i = 0;i <this.availableDeals.length;i++){
          if(this.availableDeals[i]._id === deal._id){
            this.availableDeals[i].enabled = true;
            this.attachedDeal =   this.availableDeals[i]
          }
          else{
            this.availableDeals[i].enabled = false;
          }
        }
      }
      else{
        console.log('deal disabled');
        // this.removeDeal(deal);
      }
    }
  }
  fetchDeals(){
    let userID = this._config.USER_ID;
    let _self= this;
    return new Promise((res,rej)=>{
      console.log("deals service : get all deals");
      _self._http.get(_self._config.SERVER_URI+'/api/v2/deals/'+_self._config.USER_ID)
      // 5780d754ecdadcc61cbf91c9
      // _self._http.get(_self._config.SERVER_URI+'/api/v2/deals/'+'5780d754ecdadcc61cbf91c9')
        .subscribe(d =>{
            res(d.json());
        }, e => {
            rej(e);
        });
    });
  }

  dismiss(data) {
    if(data){
      this.viewCtrl.dismiss(this.attachedDeal);
    }else{
      this.viewCtrl.dismiss({status:'closing it'});
    }

  }
}

// */
