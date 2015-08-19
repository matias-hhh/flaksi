#flaksi

Flaksi is an (another) implemetation for **Facebook's Flux-architecture**. I made flaksi to hone my js-skills, and to certain extent I didn't seem to grow too fond of any of the other Flux frameworks on the market. Flaksi works properly **only with react js**.

##How it works


As every flux framework, flaksi tries to reduce boilerplate code and make the opration much more simple and straightforward. Let's begin with stores, since understanding how they work makes flaksi easy to grasp.

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

As we can see, the ``actionHandler``-object consist of handler functions which are given **the same name as the action** which is supposed to trigger them. The handler is given the action as a parameter. Also, if ``waitFor`` is needed, it can be accessed as a parameter too as you can see in the above code.

The **important part** in the handler-functions is that in addition of saving the state in the store, the **changed state is also returned** to the caller aka the dispatcher which then passes the combined state object from all stores to the react app's setState after all ``actionHandlers`` have fired.

Stores have some helper methods for achieving **immutability** so that in react you can use the ``(oldProps !== newProps)`` -check, ``setState`` and ``appendState``. Both methods accept a state object as a parameter, which is sent eventually to react's setState-method also. ``setState`` erases previous state of the stated properties and sets new ones, when ``appendState`` is used with lists, and it does at it says. Both methods return the changed state.

You can get specified state properties from a store at any time using stores's ``getState``-method, which accepts key-strings as parameters

```js
	someStore.getState('someState'); // returns the state stored to the someState-key

	someStore.getState('someState', 'anotherState'); // returns {someState: someData, anotherState: moreData}

	someStore.getState(); // returns the whole state-object of the store
```

####Dispatcher:

Dispatcher dispatches actions one at a time and implements waitFor.

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