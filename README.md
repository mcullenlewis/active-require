# ActiveRequire
Load and reload your Node.js modules whenever you wish, bypassing the require cache, and without having to restart your application.

##### Download via `npm`:
##### `> npm install --save active-require`
<br>

### Basic usage for loading and reloading:
(Note: do not assign module variables
you plan to reload using `const`, as attempts to reassign these values at a later time will produce an error)
```javascript
//load the ActiveRequire module itself
const _require = require('active-require')
//load your target module using ActiveRequire
var myModule = _require('my-module')

//later, after having made changes to the module's files and/or dependencies, reload the module
myModule = _require('my-module')
//myModule will now contain your updated module's content
```

### Or, use ActiveRequire's helper methods:

###### Load a single module and assign it to a namespace:
```javascript
_require.set('myModule', 'my-module')

myModule;
//now returns the loaded module from the 'my-module' package
```

###### Or, load multiple modules at once:
```javascript
//use keys to define each namespace and the each key's
//value to define the module to load for that namespace
_require.set({
  myModule : 'my-module',
  request : 'request',
  mongo : 'mongodb',
  _ : 'underscore'
})
// myModule, request, mongo, and _ are now all defined
// in the global scope and assigned their respective modules
```

###### Later, reload one of the modules:
```javascript
_require.reset('myModule')
//updated module content will be loaded and assigned to myModule namespace

myModule;
//now returns updated module
```

###### Or, reload multiple modules:
```javascript
_require.reset('myModule', 'mongo', '_')
//OR
let targetModules = ['myModule', 'mongo', '_']
_require.reset(targetModules)

//each module will be reloaded and the reloaded
//value will be assigned to the appropriate namespace
```

## API
#### `_require(module)`
Load or reload a target module, using the same approach and format as the traditional `require()` method.

##### Arguments:
Argument | Description | Type | Required | Default
---      | ---         | ---  | ---      | ---
`module` | The target module you wish to load (should match usual `require()` target module format). | String | Yes | n/a
___

#### `_require.set(namespace, [module], [context])`
Load a module and assign it to a specific namespace in the provided context's scope (default scope is `global`).

##### Arguments:
Argument | Description | Type | Required | Default
---      | ---         | ---  | ---      | ---
`namespace` | *If String*:<br>Defines the namespace to which the loaded module should be assigned.<br><br>*If Object*:<br>A set of key:value pairs, where each key defines the namespace to be used and each value defines the module to be loaded and assigned to the requisite namespace. | String/Object | Yes | n/a
`module` | The module to be loaded and assigned to the namespace provided by the `namespace` argument. | String | No | `null`
`context` | The context within which the module should be loaded and assigned. | Object | No | `global`
___

#### `_require.reset(...namespaces)`
Reload the modules assigned to each provided namespace (will only work for modules and namespaces previously loaded using the `_require.set()` method).

##### Arguments:
Argument | Description | Type | Required | Default
---      | ---         | ---  | ---      | ---
`namespaces` | Either a single module namespace, multiple independent module namespaces, or an array of module namespaces that have been loaded using the `_require.set()` method previously, and that you would now like to have be reloaded and re-assigned to the namespace(s) provided. | String/Array | Yes | n/a
___

#### `_require.useCommandLine()`
Starts an `repl` session, allowing for modules to be loaded and reloaded via the command-line (using the `_require.set()` and `_require.reset()` methods) for any Node.js application being run in a terminal environment.
___

#### `_require.map`
Returns an object map containing information on the current namespaces defined via the `_require.set()` and `_require.reset()` methods and the module sources/values assigned to those namespaces.
___

**For any additional questions and/or comments, please contact: [mcullenlewis@gmail.com](mailto:mcullenlewis@gmail.com) **
