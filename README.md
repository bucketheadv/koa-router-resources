# koa-router-resources

# Install

```bash
npm install sven199019/koa-router-resources
```

# Usage

```js
const app = require('koa')();
var router = require('koa-router-resources');

router.configControllersPath('./app/controllers'); // controllers path
// will load app/controllers/users.js
router.resources('users', {}, function() {
  // will load app/controllers/admin/posts.js
  this.resources('admin/posts', { as: 'articles', only: ['index', 'new'] }, function() {
    // will load comments.js
    this.collections([
      { method: 'get', path: 'test1' }
    ]);
    this.members([
      { method: 'get', path: 'test2' }
    ]);
    this.resources('comments', { as: 'coms', except: ['edit', 'update']});
  });
});

app.use(router.routes());
```

This code will generate routes below:

```bash
GET /users
GET /users/new
POST /users
GET /users/:id
GET /users/:id/edit
PUT /users/:id
DEL /users/:id

GET /users/:user_id/articles
GET /users/:user_id/articles/new
GET /users/:user_id/articles/test1
GET /users/:user_id/articles/:id/test2

GET /users/:user_id/articles/:article_id/coms
GET /users/:user_id/articles/:article_id/coms/new
POST /users/:user_id/articles/:article_id/coms
GET /users/:user_id/articles/:article_id/coms/:id
DEL /users/:user_id/articles/:article_id/coms/:id
```
