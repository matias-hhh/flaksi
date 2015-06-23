var ActionCreator = function(dispatch) {
  this.dispatch = dispatch;
};

ActionCreator.prototype = {

  createServerAction: function(type, data) {
    if (this.serverApiHandler) {
      this.serverApiHandler({type: type, data: data})
        .then(function(apiData) {
          this.dispatch({type: type, data: apiData});
        }.bind(this))
        .catch(function(err) {
          console.error(err);
        });
    } else console.error('No serverApiHandler defined!');
  },

  createViewAction: function (type, data) {
    this.dispatch({type: type, data: data});
  },

  registerServerApiHandler: function(callback) {
    this.serverApiHandler = callback;
  }
};

module.exports = ActionCreator;