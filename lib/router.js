const path = require('path');
const inflected = require('inflected');
class Router {
  constructor(router){
    this._router = router;
    this._parent_prefix = '/';
    this._parent_model = null;
  }

  configControllersPath(ctrlPath) {
    this._controllersPath = ctrlPath;
  }

  _genSubPath(model, element, prefix) {
    let action = element.action || element.path;
    let method = element.method || 'get';
    let routePath = path.resolve(prefix, element.path)
    this._router[method].call(this._router, routePath, model[action])
  }
  members(models) {
    models.forEach((ele) => {
      let filePath = path.resolve(this._controllersPath, inflected.pluralize(this._parent_model));
      let model = require(filePath);
      let prefix = path.resolve(this._parent_prefix, `:${this._parent_map_to}_id`);
      this._genSubPath(model, ele, prefix);
    });
  }

  collections(models) {
    models.forEach((ele) => {
      let filePath = path.resolve(this._controllersPath, inflected.pluralize(this._parent_model));
      let model = require(filePath);
      this._genSubPath(model, ele, this._parent_prefix);
    });
  }

  resources(model, options = {}, callback) {
    let prefix_origin = this._parent_prefix;
    let model_origin = this._parent_model;

    let filePath = path.resolve(this._controllersPath, model);
    let ctx = require(filePath);
    let mapTo = options.mapTo || model;
    let as = options.as || model
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

    this._mapTo = mapTo;

    restRoutes.filter(x => methods.includes(x.action)).forEach((ele) => {
      var routePath;
      if(this._parent_model) {
        routePath = path.resolve(this._parent_prefix, `:${this._parent_map_to}_id`, ele.path);
      } else{
        routePath = `/${ele.path}`;
      }
      this._router[ele.method].call(this._router, routePath, ctx[ele.action]);
    });

    if (callback) {
      this._parent_model  = inflected.singularize(model);
      this._parent_map_to = inflected.singularize(as);
      this._parent_prefix = path.resolve(this._parent_prefix, `${as}`);
      callback.call(this);
    }

    //this._router.prefix(prefix_origin);
    this._parent_model = model_origin;
    this._parent_prefix = prefix_origin;
  }

  routes() {
    return this._router.routes();
  }
}

module.exports = Router;
