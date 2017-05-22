const _path = require('path')

// private values, set to working values on first primary function evocation
let _parent = null;
let _childRefs = null;

/** PRIMARY EXPORT FUNCTION **/
function _require(mod){

  // if first function call, set private values and remove self-references;
  // this process allows modules to be loaded from the parent context,
  // making the active-request module essentially invisible in its loading role
  if(!_parent){
    _parent = module.parent;
    _childRefs = _parent.children;
    removeSelfRefs()
  }

  // get absolute path to module
  mod = getAbsolute(mod)

  // if module has been loaded previously, remove it (and its dependencies) from cache
  if(cacheList().includes(mod)){
    uncache([mod, ...getDependencies(mod)])
  }

  // load the module from the context of the parent module
  return _parent.require(mod)
}




/** SECONDARY EXPORT PROPERTIES AND METHODS **/

// used for storing context-namespace-module associations for the below 'set' and 'reset' methods
_require.map = new Map()

// require a module and set its value to a defined namespace in either:
// a) the global scope, if no 'context' argument is included; or,
// b) within the scope of a particular object/context if 'context' argument is defined
_require.set = function(namespace, mod, context){
  if(typeof context !== 'object'){
    context = global;
  }
  // load and store module reference
  _require.map.set(namespace, {mod : mod, context : context, value : _require(mod)})
  // assign module value to specified context and namespace
  Object.defineProperty(context, namespace, {get : function(){ return _require.map.get(namespace).value }, configurable : true})
  return true;
}

// reload the module associated with a previously defined namespace and context
_require.reset = function(namespace){

  //check to see if namespace has been previously defined
  if(_require.map.has(namespace)){
    //if present, reload the module associated with the namespace and re-assign the reloaded value
    let ref = _require.map.get(namespace)
    return _require.set(namespace, ref.mod, ref.context)
  }

  // if namespace has not been previously defined using 'set', returns false,
  // to let user know namespace entry does not exist
  return false;
}

_require.useCommandLine = function(){
  let repl = require('repl').start({useGlobal : true})
  repl.context._require = _require
  repl.on('exit', ()=>{
    console.log('Process now exiting.')
    process.exit()
  })
}





/*** HELPER FUNCTIONS ***/

// shortcut to return list of current require cache entries
function cacheList(){
  return Object.keys(require.cache)
}

// cache removal function for enabling reloads
function uncache(files){
  for(let file of files){
    //remove cache entry
    delete require.cache[file]
    //remove child reference
    removeChildRef(file)
  }
}

// removes secondary reference to previously loaded modules
// held within the parent module's 'children' list
function removeChildRef(filepath){
  let len = _childRefs.length
  for(let i = 0; i < len; i++){
    if(_childRefs[i].filename === filepath){
      _childRefs.splice(i, 1)
      return;
    }
  }
}

// resolve full path to modules before loading
// tries two different approaches to resolving path, to reduce chance of errors
function getAbsolute(input){
  let abs;
  try{
    return require.resolve(input)
  }catch(e){
    return _path.isAbsolute(input) ? input : _path.join(process.cwd(), input)
  }
}

// creates a map of dependencies for a module to be reloaded
// when the primary module that depends on it is reloaded;
// this allows for all changes to dependencies to be encapsulated
// in a single reload to the primary module
function getDependencies(filepath){
  //using a set ensures no module is duplicated in the dependency list
  let deps = new Set()
  let children = require.cache[filepath].children;
  getNext(children)
  //the final list is converted to an array when returned to allow more conventional
  //array prototype methods in ongoing use
  return [...deps];

  //recursive function for traversing the dependency chain
  function getNext(children){
    for(let child of children){
      deps.add(child.filename)
      if(child.children.some(file => !deps.has(child))){
        getNext(child.children)
      }
    }
  }
}

// removes references to the active-require module from require cache
// and parent module's children list, allowing for transparent loading
// and reloading of modules as if using standard 'require' from within
// parent module's context
function removeSelfRefs(){
  let mods = cacheList()
  for(let mod of mods){
    if(require.cache[mod] === module){
      delete require.cache[mod]
      break
    }
  }
  let len = _childRefs.length
  for(let i = 0; i < len; i++){
    if(_childRefs[i] === module){
      _childRefs.splice(i, 1)
      break;
    }
  }
}

// export main function
module.exports = _require
