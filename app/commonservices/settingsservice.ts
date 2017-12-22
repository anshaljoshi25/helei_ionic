import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ConfigurationService} from './configservice';

@Injectable()
export class SettingsService {

    _config;

    constructor(public config: ConfigurationService, platform: Platform) {
        platform.ready().then(d=>{
          config.init().then(d=>{
            this._config = d;
          });

        });

    }

    getConfig() {
        return this.config;
    }
}
