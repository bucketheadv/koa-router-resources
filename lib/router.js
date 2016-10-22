const path = require('path');
const inflected = require('inflected');
const merge = require('merge');
class Router {
  constructor(router){
    this._router = router;
    this.history = [];
  }

  configControllersPath(ctrlPath) {
    this._controllersPath = ctrlPath;
  }

  _genSubPath(model, element, member = true) {
    let action = element.action || element.path;
    let method = element.method || 'get';
    let history = this.history.slice(0, this.history.length - 1).map(x => {
      return `${x.as}/:${x.asModel}_id`;
    });
    let lastModel = this.history[this.history.length - 1];
    let prefix;
    if(member) {
      prefix = path.resolve('/', history.join('/'), `${lastModel.as}/:id`);
    } else {
      prefix = path.resolve('/', history.join('/'), `${lastModel.as}`);
    }
    let routePath = path.resolve(prefix, element.path);
    this._router[method].call(this._router, routePath, model[action])
  }

  members(models) {
    models.forEach((ele) => {
      let parentModel = this.history[this.history.length - 1].model;
      let filePath = path.resolve(this._controllersPath, parentModel);
      let model = require(filePath);
      this._genSubPath(model, ele);
    });
  }

  collections(models) {
    models.forEach((ele) => {
      let parentModel = this.history[this.history.length - 1].model;
      let filePath = path.resolve(this._controllersPath, parentModel);
      let model = require(filePath);
      this._genSubPath(model, ele, false);
    });
  }

  namespace(name, callback) {
    this.history.push({
      model: name,
      as: name,
      asModel: false
    });
    if(callback) {
      callback.call(this);
    }
    this._historyPop();
  }

  apiResources(model, options = {}, callback) {
    this.resources(model, merge(options, {apiOnly: true}), callback);
  }

  resources(model, options = {}, callback) {
    let filePath = path.resolve(this._controllersPath, model);
    let ctx = require(filePath);
    let as = options.as || model
    let apiOnly = options.apiOnly;
    let methods = ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'];
    let only = options.only || methods;
    let except = options.except || [];
    methods = methods.filter(x => only.includes(x)).filter(y => !except.includes(y));
    let restRoutes = [
      { method: 'get',  action: 'index',   path: `${as}` },
      { method: 'get',  action: 'new',     path: `${as}/new`},
      { method: 'post', action: 'create',  path: `${as}` },
      { method: 'get',  action: 'show',    path: `${as}/:id` },
      { method: 'get',  action: 'edit',    path: `${as}/:id/edit` },
      { method: 'put',  action: 'update',  path: `${as}/:id` },
      { method: 'del',  action: 'destroy', path: `${as}/:id` }
    ];

    if (apiOnly) {
      restRoutes = restRoutes.filter(x => !['new', 'edit'].includes(x.action));
    }

    var self = this;
    restRoutes.filter(x => methods.includes(x.action)).forEach((ele) => {
      var routePath = path.resolve('/', self.history.map(x => {
        if(x.asModel) {
          return `${x.as}/:${x.asModel}_id`
        } else {
          return x.as;
        }
      }).join('/'));
      routePath = path.resolve(routePath, ele.path);
      routePath = routePath.replace(/[\/]{2,}/, '/');
      this._router[ele.method].call(this._router, routePath, ctx[ele.action]);
    });

    if (callback) {
      let asId = as.replace(/[\/]{2,}/, '').split('/').filter(x => x.trim() != '');
      //asId.push(`:${inflected.singularize(asId[asId.length - 1])}_id`);
      let history = {
        model: model, //inflected.singularize(model),
        as: asId.join('/'),
        asModel: inflected.singularize(asId[asId.length - 1])
      }
      //let asL = as.replace(/[\/]{2,}/, '/').split('/');
      self.history.push(history);
      callback.call(this);
    }
    //this._router.prefix(prefix_origin);
    this._historyPop();
  }

  _historyPop(times = 1){
    for(let i = 0; i < times; i++) {
      this.history.pop();
    }
  }

  routes() {
    return this._router.routes();
  }

  routerStack() {
    return this._router.stack;
  }
}

module.exports = Router;
