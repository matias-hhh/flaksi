import React from 'react';

/**
* Returns a higher-order component which will fetch the state from given stores as
* they change and passes it to the original component as props. Passes also props
* passed to the higher-order components to the original.
*
* @param {React.Component} Component - State from the stores is passed to this
*     component as props
* @param {Object[]} stores - A list of store-objects to listen to
* @param {function} getStateFromStores - A function which returns an object
*     used with setState-funciton, used in fetching state from the stores
*/
export default function connectToStores(Component, getStateFromStores) {
  class StoreStateManager extends React.Component {

    constructor(props) {
      super(props);
      getStateFromStores = getStateFromStores.bind(this);
      this.state = getStateFromStores();
      this.handleStoresChanged = this.handleStoresChanged.bind(this);
    }

    handleStoresChanged() {
      this.setState(getStateFromStores);
    }

    componentDidMount() {
      stores.forEach(store => {
        store.addChangeListener(this.handleStoresChanged);
      });
    }

    componentWillUnmount() {
      stores.forEach(store => {
        store.removeChangeListener(this.handleStoresChanged);
      });
    }

    render () {
      return (
        <Component {...this.props} {...this.state} />
      );
    }
  }
  return StoreStateManager;
}
