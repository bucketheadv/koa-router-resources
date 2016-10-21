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

    it('should have the only routes with operation `except`', function() {
      this._router.resources('users', { except: ['new'] });
      const routes = this._router._router.stack.map(x => x.path);
      expect(routes).to.not.includes('/users/new');
    });

    it('should have the only routes with operation `as`', function() {
      this._router.resources('users', { as: '/admin/users' });
      const routes = this._router._router.stack.map(x => x.path);
      expect(routes).to.includes('/admin/users/new');
    });

    it('should have sub resources', function() {
      var self = this;
      this._router.resources('users', { as: '/admin/users'}, function() {
        this.resources('posts', { as: 'articles' }, function() {
          this.resources('comments', { as: 'coms', except: ['new'] }, function() {
            const routes = self._router._router.stack.map(x => x.path);
            expect(routes).to.includes('/admin/users/:user_id/articles/:article_id/coms');
            expect(routes).to.not.includes('/admin/users/:user_id/articles/:article_id/coms/new');
            expect(routes).to.includes('/admin/users/:user_id/articles/:article_id/coms/:id');
          });
        });
        const routes = self._router._router.stack.map(x => x.path);
        expect(routes).to.includes('/admin/users/:user_id/articles');
      });
    });
  });

  describe('test#collection', function() {
    beforeEach(function() {
      this._router = new Router(clone(router));
      let controllersPath = path.resolve(__dirname, 'controllers');
      this._router.configControllersPath(controllersPath);
    });
    it('should have collection routes', function() {
      var self = this;
      this._router.resources('users', {}, function() {
        this.resources('posts', {}, function() {
          this.resources('comments', {}, function() {
            this.collections([
              { method: 'get', path: 'test2' }
            ]);
            const routes = self._router._router.stack.map(x => x.path);
            expect(routes).to.includes('/users/:user_id/posts/:post_id/comments/test2');
          });
          this.collections([
            { method: 'get', path: 'test1' }
          ]);
          const routes = self._router._router.stack.map(x => x.path);
          expect(routes).to.includes('/users/:user_id/posts/test1');
        });
      })
    });
  });

  describe("test#members", function() {
    beforeEach(function() {
      this._router = new Router(clone(router));
      let controllersPath = path.resolve(__dirname, 'controllers');
      this._router.configControllersPath(controllersPath);
    });
    it('should have member routes', function() {
      var self = this;
      this._router.resources('users', {}, function() {
        this.resources('posts', {}, function() {
          this.resources('comments', {}, function() {
            this.members([
              { method: 'get', path: 'test2' }
            ]);
            const routes = self._router._router.stack.map(x => x.path);
            expect(routes).to.includes('/users/:user_id/posts/:post_id/comments/:id/test2');
          });
          this.members([
            { method: 'get', path: 'test1'}
          ]);
          const routes = self._router._router.stack.map(x => x.path);
          expect(routes).to.includes('/users/:user_id/posts/:id/test1');
        });
      });
    });
  });

  describe("test#apiResources", function() {
    beforeEach(function() {
      this._router = new Router(clone(router));
      let controllersPath = path.resolve(__dirname, 'controllers');
      this._router.configControllersPath(controllersPath);
    });
    it('should only gen api routes', function() {
      var self = this;
      this._router.apiResources('users');
      const routes = self._router._router.stack.map(x => x.path);
      expect(routes).to.not.includes('/users/new');
      expect(routes).to.not.includes('/users/:id/edit');
      expect(routes).to.includes('/users');
      expect(routes).to.includes('/users/:id');
    });
  });
});
