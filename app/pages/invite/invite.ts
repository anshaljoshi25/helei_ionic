import {Component} from '@angular/core';
import {Alert, NavController, Platform, NavParams} from 'ionic-angular';
import {ContactsService} from '../../commonservices/contactsservice';
import {Contacts, Toast} from 'ionic-native';
import {SmsService} from '../../commonservices/smsservice';
import {ConfigurationService} from '../../commonservices/configservice';
import {HomePage} from '../home/home';
import {AccountPage} from '../account/account';
/*
  Generated class for the InvitePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/invite/invite.html',
  providers: [ConfigurationService, ContactsService, Contacts, SmsService]
})
export class InvitePage {
  loadedContacts=false;
  searchText = "";
  searchedContacts;
  allSearchedContacts;
  selectedContacts;
  searchCounter=-1;
  _config;
  inviteText = "Hi there! Your friend {name} is using Helei! Find out where does he hangout! Download App : https://helei.co/v2/";
  eventInviteText = "Hi there! Your friend {name} has invited you to attend event : {link}";
  fromPage;
  constructor(private config: ConfigurationService, public nav: NavController, private navparams: NavParams, public contacts: ContactsService, public sms: SmsService, platform: Platform) {
    this.selectedContacts= [];
    this.allSearchedContacts= [];
    this.searchedContacts= [];

  //this._navParams = navParams;
  //this._prevPage = this._navParams.data.name;
  //console.log("Page is:" + this._prevPage);
  //Added simple parameter to know which type of invite user wants(to event or to app)
    this.fromPage = navparams.get("fromPage");
    var _this_ = this;
    platform.ready().then(d=>{
      config.init().then(d=>{
        this._config = config.getConfig();
      });
      setTimeout(function(){
        navigator.contactsPhoneNumbers.list(function(contacts){
          for(let c of contacts) {
            _this_.allSearchedContacts.push({name:{givenName:c.displayName, formattedName: c.displayName},phoneNumbers:[{value:c.phoneNumbers[0].number}]});
          }
          _this_.loadedContacts = true;
        },function(error){
          console.log(error);
        });
      },500);
    }).catch(e=>{
      console.log(e);
    });

  }

  selectContact(c) {
    for(let cc of this.selectedContacts) {
      if(c.phoneNumbers[0].value===cc.phoneNumbers[0].value) {
        return;
      }
    }
    this.selectedContacts.push(c);
    this.searchText="";
  }

  removeContact(c) {
    var i=0;
    for(let cc of this.selectedContacts) {
      if(c.phoneNumbers[0].value===cc.phoneNumbers[0].value) {
        this.selectedContacts.splice(i,1);
        return;
      }
      i+=1;
    }
  }
  search() {
    this.searchedContacts = [];
    if(this.searchText===undefined || this.searchText===null || this.searchText=="" || this.searchText.length<3) {
      this.searchedContacts = this.allSearchedContacts.slice();
      return;
    }
    // clearTimeout(this.searchCounter);
    var _self = this;
    // this.searchCounter = setTimeout(function(){
      for(let c of _self.allSearchedContacts) {
        if(c.name.givenName.toLowerCase().indexOf(_self.searchText.toLowerCase())>-1) {
          _self.searchedContacts.push(c);
        }
      }
    // },200);

  }

  sendInvites() {
    var _this_ = this;
    // var _smsText = _this_.inviteText;
    // //Param used here to change default sms text
    // if( _this_._prevPage == "fromEvent")
    // {
    //   var _smsText = _this_.eventInviteText;
    // }
    var selectedContacts = [];
    //get only the contacts
    for(let i of _this_.selectedContacts) {
      selectedContacts.push(i.phoneNumbers[0].value);
    }
    var mtext = _this_.inviteText;
    mtext = mtext.replace(/{name}/g,this._config.USER_NAME);
    console.log("From page " + JSON.stringify(this.navparams));
    console.log("config " + JSON.stringify(this._config));

    if(this.navparams.data.fromPage == "fromEvent"){
      mtext = _this_.eventInviteText;
      var ev = this.navparams.data.event;
      mtext = mtext.replace(/{name}/g,this._config.USER_NAME);
      mtext = mtext.replace(/{link}/g,"https://helei.co/v2/event/"+ev._id);
    }
    let confirm = Alert.create({
      title:'Send Invites?', message:'Please confirm to send invites!',
      buttons: [
        {
          text: 'Cancel',
          handler:()=>{


          }
        },{
          text: 'Send Now',
          handler:()=>{
            _this_.sms.sendBulk(selectedContacts, mtext).then(d=>{
              console.log(d);
              Toast.show("Nice! Your friends will be notified about Helei.",'3000',"bottom").subscribe(t=>{
                _this_.nav.pop();
                return;
              });


            }).catch(e=>{
              console.log(e);
            });
            }
          }
      ]
    });
    _this_.nav.present(confirm);

  }

  goBackHome(){
    console.log('go back to home page');
    console.log(this.fromPage);
    if(this.fromPage === 'fromEvent'){
      this.nav.pop();
    }else if(this.fromPage === 'fromEventCreate'){
      this.nav.setRoot(HomePage);
    }
    else{
        this.nav.pop();
    }
  }

}
