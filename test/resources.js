const Router = require('../lib/router');
const router = require('koa-router')();
const expect = require('chai').expect;
const path   = require('path');
const clone  = require('clone');

describe('Resources', function() {
  describe('test#resources', function() {
    beforeEach(function() {
      this._router = new Router(clone(router));
      let controllersPath = path.resolve(__dirname, 'controllers');
      this._router.configControllersPath(controllersPath);
    });
    it('should have the restful routes', function() {
      this._router.resources('users');
      const routes = this._router._router.stack.map(x => x.path);
      expect(routes).to.includes('/users');
    });

    it('should have the only routes with operation `only`', function() {
      this._router.resources('users', { only: ['index'] });
      const routes = this._router._router.stack.map(x => x.path);
      expect(routes).to.includes('/users');
      expect(routes).to.not.includes('/users/new');
    });
  });
});
