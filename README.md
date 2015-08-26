#flaksi

Flaksi is an (another) implemetation for **Facebook's Flux-architecture**. I made flaksi to hone my js-skills, and to certain extent I didn't seem to grow too fond of any of the other Flux frameworks on the market. Flaksi works properly **only with react js**.

**NOTE: flaksi is still in its very early stages and is subject to large changes. The documentation is quite minimal and the lib lacks proper tests at the moment, so don't let this one anywhere near a production environment.**

##How it works


As every Flux framework, flaksi tries to reduce boilerplate code and make the operation much more simple and straightforward. Btw, if you don't know the first thing about Flux, this document will not make much sense to you. Please read about Flux [here](https://facebook.github.io/flux/docs/overview.html) first.

For starters, flaksi has no bloated switch statements in stores. Instead, every store has an object called actionHandler which contains simple functions that handle incoming actions, which are much lighter to work with than the switches.

There is no need to register individual listener from stores to the React app, you need only to register your top level component to the dispatcher, which then handles the updating of all the state changes from the stores to the app.

And finally, there is no need to compose a list of actions separately. Only place we need to define action names are in the handler functions' names in the stores' actionHandlers. When registering the stores to the dispacther, it reads the handler functions' keys and forms an actionCreator from them.

####Installation:

Flaksi can be installed with npm:

``
	$ npm install flaksi
``

####Stores:
 
Stores differ from canon by having ``actionHandler`` -objects instead of callbacks which are registered to the dispatcher. The handler is given as a parameter when creating the store:

```js
	import {Store} from 'flaksi';

	const someStore = new Store({

		oneAction(action) {
			// *insert some operations to action data here*
			return someStore.setState({
				someState: action.someData,
				anotherState: action.moreData
			});
		}

		anotherAction(action, waitFor) {
			waitFor([anotherStore], () => {
				return someStore.appendState({someList: action.someData});
			});
		}

	});
```

The ``actionHandler``-object consist of handler functions which are given **the same name as the action** which is supposed to trigger them. For example, the oneAction-handler above would fire when action with type 'oneAction' is dispatched. The handler is given the action data as a parameter. Also, if ``waitFor`` is needed, it can be accessed as a parameter too as you can see in the above code.

The **important part** in the handler-functions is that in addition of storing the state in the store, the **newly changed state is also returned** to the caller aka the dispatcher, which then passes the combined state object from all stores to the react app's setState-method, after all ``actionHandlers`` have fired. This way the dispatcher updates always only the sub-states that have actually changed to the React app.

Stores have some helper methods for achieving **immutability** so that in react you can use the ``(oldProps !== newProps)`` -check, ``setState`` and ``appendState``. Both methods accept a state object as a parameter, and they handle similar to React's setState-method. ``setState`` erases previous state of the given sub-state and sets new state, when ``appendState`` is used with sub-states that are list, and it does what it says. Both methods return the changed state.

You can get specified state properties from a store at any time using stores's ``getState``-method, which accepts key-strings as parameters

```js
	someStore.getState('someState'); // returns the state stored to the someState-key

	someStore.getState('someState', 'anotherState'); // returns {someState: someData, anotherState: moreData}

	someStore.getState(); // returns the whole state-object of the store
```

####Dispatcher:

Dispatcher dispatches actions one at a time and implements waitFor. It controls everything in flaksi, and connects the react-app to the flux.

Creating a dispatcher:

```js
	import {Dispatcher} from 'flaksi'

	const dispatcher = new Dispatcher()
```

Stores and their actionHandlers are registered to the dispatcher using the register-mehtod:

```js
	dispatcher.register(someStore)

	// OR

	dispatcher.register([someStore, anotherStore])

```

Flaksi works seamlessly with react js, and is connected to the app in the app's componentDidMount-mehtod:

```js
	// ... react app stuff

	componentDidMount() {
		dispatcher.connectAppToFlux(this);
	}

	// react app stuff ...
```

After connection, the dispatcher updates the apps state automatically according to the stores after each action.

Stores can be initialized with ``dispatcher.InitializeStores(intialStateObject)``, where initialStateObject contains all states you want to initialize, for example ``{someState: someInitialData}``. ``InitializeStores()`` actually creates an action with type ``initializeStores``, and to get the initial state to the stores, you have to have a handler for that action in the stores you want to initialize, for example:

```js
	someStore = new Store({
		initializeStore(action) {
			return someStore.setState({someState: action.someState});
		}
	});
```
Initial state can be given for the react app in the apps constructor like this:

```js
	constructor(props) {
		super(props);
		this.state = dispatcher.getInitialState();
	}
```

####Actions:

The dispatcher creates an ``actionCreator`` when registering stores. It catalogues every handler function's key from the ``actionHandler``-objects and assigns a triggerAction-function for them. To get the ``actionCreator`` use dispatcher's ``getActions``-method:

```js
	const actionCreator = dispatcher.getActions();
```

Actions are triggered by calling the action name from the ``actionCreator``:

```js
	action.oneAction({
		both: {bothViewAndServerData},
		view: {
			someViewData,
			moreViewData
		},
		server: {
			mehtod: 'GET',
			url: '/api/someurl',
			someServerData,
			moreServerData
		}
	})
```

As we can see from the code, in flaksi **actions are divided to two categories, view actions and server actions**. View actions go straight to the stores and affect only the ui, but server actions are sent to the server api, and the data returned from the server is then passed to the stores. Stores can differentiate view and server actions from ``action.source``, which is valued ``'view'`` or ``'server'`` respectfully. The ``both``-object does as it says, the data there goes to both view and server actions.

The above code would dispatch a view action like this:

```js
{
	type: 'oneAction',
	source: 'view',
	someViewData,
	moreViewData,
	bothViewAndServerData
}

```

It would also make a server request using HTTP GET to url /api/someurl with following data in request body:

```js
{
	someServerData,
	moreServerData,
	bothViewAndServerData
}
```

After the server responds, the dispatcher dispatches the following server action (with some exapmle data from server):

```js
{
	type: 'oneAction',
	source: 'server',
	someDataFromServer,
	moreDataFromServer
}
```
