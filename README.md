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

Flaksi makes developer's life easy by requiring very little boilerplate code, and the stores handle state similarly to react components so it's quite easy to understand even for people unfamiliar with Flux architecture.

As with Facebook's Flux, the ``dispatcher`` is the brains of flaksi, but it is hidden from the user, so no one has to really care how it works, other than it dispatches actions one at a time so no conflicts can happen, and it can give some handy debug messages when something goes wrong during development.

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
	                droppedPost={this.state.droppedTask} />
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

The ``renderApp``-function shown above does many things:

* Initializes the dispatcher
* Initializes stores with the given InitialState-object
* Creates an actionCreator-object with all the actions found from stores to the window (yes, window! More about this later in this doc)
* Renders the given component with InitialState-object given as props (named InitialState) to a given mount point
* Gives a reference of the app for the dispatcher so it can automatically update the state from stores to the app
* Returns a function to be exported for server-side rendering (Isomorphic! No dispatcher here, function accepts an initialState-object as parameter)

More documentation coming tomorrow!

####Stores:
 

####Actions:


