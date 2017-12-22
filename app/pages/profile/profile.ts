import {Component} from '@angular/core';
import {NavController, NavParams, Platform, ViewController, Modal, Loading, Popover, MenuController} from 'ionic-angular';
import {ConfigurationService} from '../../commonservices/configservice';
import {EventsFetcherService} from '../../commonservices/eventsfetchservice';

@Component({
  templateUrl: 'build/pages/profile/profile.html',
  providers:[ConfigurationService, EventsFetcherService]
})
export class ProfilePage {

  _config:any;
  p={};
  eventsFetcher:any;
  constructor(private navController: NavController,private _navParams: NavParams,private config: ConfigurationService,private platform: Platform, eventsFetcher:EventsFetcherService) {
    console.log('on profle tab');

    platform.ready().then(d=>{
      config.init().then(d=>{
        this._config = config.getConfig();
        console.log('platform and config initialized profile page');
        console.log(this._config);
        this.p.name=this._config.USER_NAME;
        this.p.mobile=this._config.PHONE_NUMBER;

      });
    });

  }
}
