import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ContactsService} from '../../commonservices/contactsservice';
import {Contacts} from 'ionic-native';
/*
  Generated class for the InvitePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/invite/invite.html',
  providers: [ContactsService, Contacts]
})
export class InvitePage {

  searchText = "";
  constructor(public nav: NavController, private contacts: ContactsService) {}

  search() {
    this.contacts.getContact(this.searchText).then(d=>{
      console.log(d.json());
    }).catch(e=>{
      console.log("error-ContactsService" + JSON.stringify(e));
    });
  }

}
