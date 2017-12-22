import {Injectable, Inject} from '@angular/core';
import {Alert, NavController} from 'ionic-angular';
import {Http, Headers, RequestOptions} from '@angular/http';
import {ConfigurationService} from '../commonservices/configservice';

@Injectable()

export class MapService {
  _http: Http;
  _config : ConfigurationService;
  _map:any;
  geocoder:any;
  service:any;
  infoWindow:any;
  markers:any;
  _mapOptions={
    zoom: 10,
    minZoom:1,
    maxZoom:17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  _key = 'AIzaSyCAcuRqPsIdiVo8c5iSx9NXu61hbn9yXQo';
  constructor(http: Http, config: ConfigurationService){
    this._config = config.config;
    this._http = http;
    console.log('initialized map service');
    this._map=null;
    this.markers=[];

  }


  init(element,mapOptions){
    console.log('initializing map with current loc');
    return new Promise((res,rej)=>{
      if(mapOptions.center===null){
        console.log('load map with fresh data');
        this.currentLocation().then((latLng)=>{
          if(mapOptions){
              this._mapOptions = mapOptions;
              this._mapOptions.center= latLng;
            }else{
              this._mapOptions.center= latLng;
            }
            this._map = new google.maps.Map(element,this._mapOptions);
            if(this._map!=null){
                res(this._map);
            }
        }).catch((err)=>{
          rej();
        })
      }
      else{
        console.log('load map with old data');
          this._map = new google.maps.Map(element,mapOptions);
          if(this._map!=null){
              res(this._map);
          }else{
            rej();
          }
      }

    });
  }

  updateMapBylatLng(lat,lng){
    console.log('updating map lat lng');
    console.log(this.markers)
    if(this._map!=null){
      this._map.setCenter(new google.maps.LatLng(lat,lng));
      // console.log(this.markers)
    }
    else{
      console.log('map is not initialized');
      return;
    }
    // this.markers=[];
    // this.markers[0].setPosition(new google.maps.LatLng(lat,lng));
  }

  on(event,callback){
    var self = this;
    google.maps.event.addListener(this._map, event, function(e){
      callback.call(self,e);
    });
  }


  currentLocation(){
    let posOptions = {timeout: 10000, enableHighAccuracy: true};
    return new Promise ((res,rej)=>{
      navigator.geolocation.getCurrentPosition((pos)=>{
        let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        res(latLng)
      }, (err) => {
        console.log(err);
        rej(err);
      }, posOptions)
    })
  }

  addMarker(markerOpts){
      let marker = new google.maps.Marker({
        map:this._map,
        animation: google.maps.Animation.DROP,
        position:markerOpts.latLng,
        draggable:markerOpts.draggable
      });
        this.markers.push(marker);
        return marker;
  }

  updateMarker(marker,opts){
    console.log('updating marker');
    marker.setPosition(opts.latLng);
  }

  getPlaceBylatLng(latLng){
    console.log('getting place: by lat lng')
    // console.log(latLng.lng());
    return new Promise((res,rej)=>{
      this._http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+latLng.lat()+','+latLng.lng()+'&key=' + this._key)
      .subscribe((d) => {
          res(d.json());
      }, e => {
          rej(e);
      });
    })
  }
  getPlaceByString(address){
    console.log('getting place: by address')
    // console.log(address);
    return new Promise((res,rej)=>{
      this._http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=' + this._key)
      .subscribe((d) => {
          res(d.json());
      }, e => {
          rej(e);
      });
    })
  }




}
