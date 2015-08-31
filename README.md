#flaksi

Flaksi is an (another) implemetation for **Facebook's Flux-architecture**. I made flaksi to improve my js-skills, and to certain extent I didn't seem to grow too fond of any of the other Flux frameworks on the market. Flaksi works properly **only with react js**.

**NOTE: flaksi is still in its very early stages and is subject to large changes. The documentation is quite minimal and the lib lacks proper tests at the moment.**

##Installation:

Flaksi can be installed with npm:

``
  $ npm install flaksi
``

And usage:

```js
// Flaksi
import Flaksi from 'flaksi';

// Store
import {Store} from 'flaksi';
```

##Introduction

First thing to note is that flaksi is written in **ES6** version of javascript, so for example ``babel`` and ``webpack`` are the way to go with this (as for the time being).

Flaksi makes developer's life easy by requiring very little boilerplate code, and the stores handle state similarly to react components so it's quite easy to understand even for people not so familiar with the Flux architecture.

As with Facebook's Flux, the ``dispatcher`` is the brains of flaksi, but it is hidden from the user, so no one has to really care how it works, other than it dispatches actions to the stores, pieces the states from the stores together into one state object and sets the the React app's state with it.

Flaksi is designed to work with React apps which have a **top-down approach to state**, in other words there is **one top-level component** which contains all the states and it **passes them as props to lower-level components**. An example of this kind of app:

```js
  // ...importing of components, stores, etc here... 

  // The app
  class ExampleApp extends React.Component {

    constructor(props) {
      super(props);
      this.state = this.props.initialState;
    }

    render() {
      return (
        <body>
          <Navbar taskViewState={this.state.taskViewState}
                  chatViewState={this.state.chatViewState} />
          <div className="main-container">
            <Sidebar />
            <Chat viewState={this.state.chatViewState}
                  messages={this.state.messages}
                  droppedTask={this.state.droppedTask} />
            <Tasks viewState={this.state.taskViewState}
                   taskList={this.state.taskList}
                   task={this.state.task}
                   comments={this.state.comments} />
          </div>
        </body>
      );
    }
  }

  let stores = [
    postStore,
    commentStore,
    messageStore,
    viewStateStore
  ];

  // A magical function which reduces our boilerplate to minimum
  export default Flaksi.renderApp(ExampleApp, document.body,
    window.initialState, stores);
```
## How it works

The ``renderApp``-function shown above does many things and gives a good overview how flaksi works:

* Initializes the dispatcher
* Initializes stores with the given InitialState-object
* Creates an actionCreator-object with all the actions found from stores to the window (yes, window! More about this later in this doc)
* Renders the given component with InitialState-object given as props (named InitialState) to a given mount point
* Gives a reference of the app for the dispatcher so it can automatically update the state from stores to the app
* Returns a function to be exported for server-side rendering (Isomorphic! No dispatcher here, function accepts an initialState-object as parameter)

#### Initialization

Flaksi handles state similarly to React from the start. First thing to happen when rendering an app with the ``renderApp`` (after creating the dispatcher instance) is getting the initial state both to the app and to the stores. 

The state object is just a plain object with the states, for example if you wanted to give an initial value to some of states in above example app, the initialState-object could look like this:

```js
  {
    taskViewState: 'default',
    chatViewState: 'default',
    messages: messageData,
    taskList: taskData
  }
```

This object is passed as props to the app, which can be set as initial state using the constructor of the React Component, just as in the ExampleApp above. The same state object is passed also to all the stores, which is used to initialize their states, just like in React Components, in their constructor. Because of the nature of the stores, they of course don't store the state as whole, but cherry pick the states relevant to them. An example of this can be found below in the Stores-section.

#### Changing app's state

Here we follow the Flux's main principle, the one way data flow. The actual state is stored in the stores, and when there is a change in state, the dispatcher collects the new state from all the stores and calls the app's setState with the new state object. State trickles down from top-level components to all other components in the tree.

To actually change the current state, for example following user interaction or new data from the server, the only way to do it is to dispatch an action. Next sections discuss stores and actions in detail.

####Stores:
 
Stores in flaksi can be thought as React Components stripped of anything but the state. Stores ares ES6 classes which extend the flaksi's Store base-class. The stores hold the state and are also the only entitys able to manipulate state. It's useful to divide stores to different logical categories, for example messageStore and taskStore.

The most peculiar thing in flaksi stores are the action handler methods. Instead of bloated switch statements like in most Flux implementations, the incoming actions are handled by methods with the same name as the action's type. Here's an example store:

```js
  import {Store} from 'flaksi';

  export default class messageStore extends Store {

    // Picking the relevant states from the initialState-object
    constructor(initialState) {
      super();
      this.state = {messages: initialState.messages};
    }

    // Action handler(s)
    createMessage(action) {
      let messages = this.state.messages;
      messages.push(action.message);
      this.setState({messages});
    }

  }
```

When an action is dispatched, the dispatcher checks all stores if they have a method with a same name as the action's type. If a match is found, the method is called with the action given as a parameter. In messageStore's case, an action with type 'createMessage' would trigger the only action handler it has.

An important thing to note is, that just like in React Component, you have to use the store's setState-mehtod to actually change the state. It works essentially the same way than in React but it makes the new states to refer a new object, which means that React can see for example if currentProps !== nextProps, so we're talking about immutability here. For example, if we have a store with current state like this:

```js
  {
    someState: someData,
    anotherState: moreData
  }
```

and we set the state during an action like this:

```js
  this.setState({someState: newData});  
```

Now only the ``someState`` is made to refer to a new object so when you would compare the old someState to the new someState (essentially comparing references), they would not match. And when eventually the state gets to the application, it can see what state did change and what did not. This can be awesome if performance is crucial.

####Actions:

When initializing the dispatcher, the dispatcher goes through all the stores and reads all their action handler names. An object called actionCreator is parsed out of them, and each action has a function called triggerAction attached to them, which wraps the data given to it into an action and handles also server api interaction.

The actionCreator is then attached to the window. This is because if you are making a project consinsting of multiple "single-page-apps", and you want to reuse components, the actions can still be always found from the same place.

So here is how we would trigger an action if we would have a messageStore as one of our stores and therefore having ``createMessage`` in our actionCreator:

```js
  window.actionCreator.createMessage({
    both: {messageData},
    view: {someFlag: true}
    server: {
      method: 'POST',
      url: '/api/messages',
      someOtherFlag: false
    }
  })
```

The actions in flaksi are divided to two types: view and server. What we are essentially doing when triggerign an action is describe what goes to the server and what goes directly to the view, so actually we trigger two actions, if both types are defined. The above code would dispatch a view action like this:

```js
  {
    type: 'createMessage',
    source: 'view',
    messageData,
    someFlag: true
  }
```

It would also make a http-request using POST-method to the url ``/api/messages`` with data:

```js
  {
    messageData,
    someOtherFlag: false
  }
```

After the server responds, the data from the response body is assinged to an action and if for example the server's response body is ``{success: true}``, the resulting action would be like this:

```js
  {
    type: 'createMessage'
    source: 'server',
    success: true
  }
```
