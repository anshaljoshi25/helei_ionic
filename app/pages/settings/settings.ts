import {Component, Inject} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SettingsService} from '../../commonservices/settingsservice';
import {ConfigurationService} from '../../commonservices/configservice';
/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
  providers: [SettingsService, ConfigurationService]
})
export class SettingsPage {

  constructor(public nav: NavController, public settings: SettingsService) {

  }

  change(k,v) {
        console.log();
  }

  changeBool(k,event) {
    if(event.checked===true) {
      this.settings.config.set(k,"TRUE");
    } else {
      this.settings.config.set(k,"FALSE");
    }
  }

}
