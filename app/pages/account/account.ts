import {Component} from '@angular/core';
import {Alert, NavController, Platform, NavParams} from 'ionic-angular';
import {Contacts, Toast} from 'ionic-native';
import {ConfigurationService} from '../../commonservices/configservice';
import {AttendingTab} from '../attending/attending';
import {ProfilePage} from '../profile/profile';
import {HomePage} from '../home/home';



@Component({
  templateUrl: 'build/pages/account/account.html',
  providers: [ConfigurationService]
})

export class AccountPage{

  tab1Root: any;
  tab2Root: any;
  fromPage;
  constructor(private config: ConfigurationService, public nav: NavController, private navparams: NavParams,platform: Platform){
    console.log('loading account page');
    this.fromPage = navparams.get("fromPage");
    console.log(this.fromPage);
    platform.ready().then(d=>{
      config.init().then(d=>{
        this._config = config.getConfig();
        console.log('platform and config initialized');
      });
    });
    this.tab1Root = AttendingTab;
    this.tab2Root = ProfilePage;
  }

  goBackHome(){
    if(this.fromPage==='fromEventCreate'){
      console.log('came from eventc reation going to home');
      this.nav.setRoot(HomePage);
    }
    // else if(this.fromPage==='fromInvite'){
    //   console.log('came from invite going to home');
    //   this.nav.setRoot(HomePage);
    // }
    else {
      console.log('came from normal and going to pop now');
      this.nav.pop();
    }
  }


}
