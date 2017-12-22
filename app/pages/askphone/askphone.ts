import {Component} from '@angular/core';
import {ViewController, NavController, Alert} from 'ionic-angular';
import {DeviceService} from '../../commonservices/deviceservice';
import {LoginService} from '../../commonservices/loginservice';
import {ConfigurationService} from '../../commonservices/configservice';
import {Toast} from 'ionic-native';
import {SmsService} from '../../commonservices/smsservice';
/*
  Generated class for the AskphonePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/askphone/askphone.html',
  providers: [LoginService, ConfigurationService, SmsService]
})
export class AskphonePage {
  allowMsg;
  resend;
  phone = "";
  name ="";
  constructor(private nav: NavController, public loginService: LoginService, private _view: ViewController, private sms: SmsService) {
    this.allowMsg = true;
    this.resend = false;
  }

  resendCode() {
    this.allowMsg=true;
    this.login(this.phone, this.name);
  }

  login(phone,name) {
    this.phone=phone;
    this.name=name;
    this.resend = true;
    if(phone==undefined || phone== null || phone=="" || name == undefined || name=="" || name==null) {
      Toast.show("Please enter phone number and name!",'3000',"bottom").subscribe(t=>{
        return;
      });
      return;
    }
    if((this.phone.length)<=10) {
      Toast.show("Please enter correct phone number",'3000',"bottom").subscribe(t=>{
        return;
      });
      return;
    }

    //generated slug
    this.loginService.slug(phone).then(generatedSlug=>{
      //send sms to user
      console.log(JSON.stringify(generatedSlug));
      console.log(generatedSlug);
      if(this.allowMsg){
        this.sms.sendBulk([phone],"Your Helei verification code is : " + generatedSlug.value);
        this.allowMsg = false;
      }
      let confirm = Alert.create({
        title:'Verify Phone', message:'Please enter the verification code: ',
        inputs:[{
          name: 'slug',
          placeholder: 'Verification Code'
        }
        ],
        buttons: [
          {
            text: 'Cancel',
            handler:()=>{


            }
          },{
            text: 'Verify',
            handler:(d)=>{
              //verify and reg
              this.loginService.verifySlug(phone, d.slug).then(d=>{
                  this.loginService.login(phone,name).then(d=>{
                    let opts = {loadEvents:true};
                    this._view.dismiss({status:"LOGGED_IN"});
                  }).catch(e=>{
                    console.log("error!");
                  });
              },e=>{
                if(e.status=="ERROR") {
                  Toast.show("Verification failed! Please enter correct code.",'3000',"bottom").subscribe(t=>{
                    return;
                  });
                } else if(e.status=="CODE_EXPIRED") {
                  Toast.show("Code expired! Please try again.",'3000',"bottom").subscribe(t=>{
                    return;
                  });
                }
              });
            }
          }
        ]
      });
      this.nav.present(confirm);
    },e=>{
      Toast.show("Verification code could not be generated! Try again after some time.",'3000',"bottom").subscribe(t=>{
        return;
      });
    });


  }
}
