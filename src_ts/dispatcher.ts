import assign from './assign';
import resource from './resource';
import Store from './store';

export default class Dispatcher {
    constructor(stores: Store[], debug: boolean=false) {
        
    }
    
    private actions: any[];
    private promises: Promise[];
    private stores: Store[];
    private dispatchQueue: any[];
    private isDispatching: boolean = false;
    private debug: boolean;
}