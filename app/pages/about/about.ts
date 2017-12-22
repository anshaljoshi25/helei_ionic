import {Component, Inject} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AppRate}  from 'ionic-native';

@Component({
  templateUrl: 'build/pages/about/about.html',
})
export class AboutPage {

  constructor(public nav: NavController) {

  }

feedback(){
}
contact(){
}
review(){
  AppRate.preferences = {
    openStoreInApp: true,
    displayAppName: 'Helei',
    usesUntilPrompt: 5,
    promptAgainForEachNewVersion: false,
    storeAppURL: {
      ios: '<my_app_id>',
      android: 'market://details?id=<package_name>',
    },
    customLocale: {
      title: "Rate %@",
      message: "If you enjoy using %@, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!",
      cancelButtonLabel: "No, Thanks",
      laterButtonLabel: "Remind Me Later",
      rateButtonLabel: "Rate It Now"
    }
  };
  AppRate.promptForRating(true);
}

}
