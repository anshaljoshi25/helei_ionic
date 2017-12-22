import {Component, ViewChild} from '@angular/core';
import {Platform, ionicBootstrap, Nav, NavController, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {SqliteService} from './commonservices/sqliteservice';
import {SQLite, Deeplinks} from 'ionic-native';
import {SettingsPage} from './pages/settings/settings';
import {InvitePage} from './pages/invite/invite';
import {HelpPage} from './pages/help/help';
import {AskphonePage} from './pages/askphone/askphone';
import {EventPage} from './pages/events/event';
import {AccountPage} from './pages/account/account';
import {AboutPage} from './pages/about/about';
import {enableProdMode} from '@angular/core';

@Component({
  templateUrl: 'build/app.html',
})
export class MyApp {
  rootPage: any = HomePage;
  @ViewChild("mainMenu") _nav;
  @ViewChild(Nav) navChild: Nav;
  constructor(private platform: Platform, private menu: MenuController) {
    // enableProdMode();
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need

      StatusBar.styleDefault();
    });
  }


  ngAfterViewInit() {
    this.platform.ready().then(()=>{
      //check for Deeplinks
      Deeplinks.routeWithNavController(this.navChild,{
        '/v2/event/:eid' : EventPage
      }).subscribe((match)=>{
        console.log("Found");
        console.log(JSON.stringify(match));
      }, (noMatch)=>{
        console.log("!Found");
        console.log(JSON.stringify(noMatch));
      });
    });
  }

  pushPage(name) {
    this.menu.close();
    console.log(name);
   if(name==='settings') {
      this._nav.push(SettingsPage);
    } else if(name==="invite") {
      this._nav.push(InvitePage);
    } else if(name==="help") {
      this._nav.push(HelpPage);
    } else if(name==='about'){
      this._nav.push(AboutPage);
    } else if (name==="account"){
      console.log('pushing acc page');
      this._nav.push(AccountPage);
    }
  }

}
enableProdMode();
ionicBootstrap(MyApp, [SqliteService]);
