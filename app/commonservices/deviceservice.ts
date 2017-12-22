import {Injectable} from '@angular/core';


@Injectable()
export class DeviceService {
    data: any;
    error: any;
    constructor() {
        navigator.plugins.refresh();
        console.log(navigator.plugins.length);
        // navigator.plugins.sim.getSimInfo(function(result){
        //     this.data = result;
        // },function(error){
        //     this.data=null;
        //     this.error = error;
        // });
    }
    
    public getSimInfo() {
        return this.data==null?{}:this.data;
    }
    
    public getErrorState() {
        return this.error;
    }
}