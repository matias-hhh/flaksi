import dispatcher from './dispatcher';

export default class Store {

  constructor(debug=false, debugStoreName=undefined) {
    this.data = {};
    this.debug = debug;
    this.debugStoreName = debugStoreName;
  }

  debugConsole(message) {
    if (this.debug) {
      if (this.debugStoreName) {
        console.log(this.debugStoreName + ': ' + message);
      } else {
        console.log('store: ' + message);
      }
    }
  }

  register(actionHandler) {
    this.dispatchToken = dispatcher.register(actionHandler);
  }

  getData(...keys) {
    this.debugConsole('getData called');
    if (keys) {
      if (keys.length === 1) {
        return this.data[keys[0]];
      } else {
        let data = {};
        keys.forEach(key => {
          data[key] = this.data[key];
        });
        return data;
      }
    } else {
      return this.data;
    }
  }

  setData(newData) {
    Object.keys(newData).forEach(key => {
      // Delete the old property so the newly set object refers to a different object
      // (oldProps !== newProps)
      delete this.data[key];
      this.data[key] = newData[key];
    });
    this.debugConsole('data set');
  }

  appendData(newDataObject) {
    Object.keys(newDataObject).forEach(key => {
      if (this.data[key]) {
        this.data[key].push(newDataObject[key]);
        // Clone the data, same reasons than in setData
        this.data[key] = this.data[key].slice();
      } else {
        this.data[key] = [newDataObject[key]];
      }
    });

    this.debugConsole('data appended');
    this.emitChange();
  }

  resetData() {
    this.data = {};
  }
}
