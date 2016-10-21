module.exports = {
  index: function(ctx) {
    ctx.body = 'all users';
  },

  new: function(ctx) {
    ctx.body = 'new user';
  },

  create: function(ctx) {
    ctx.body = 'create user';
  },

  show: function(ctx) {
    ctx.body = 'show user';
  },

  edit: function(ctx) {
    ctx.body = 'edit user';
  },

  update: function(ctx) {
    ctx.body = 'update user';
  },

  destroy: function(ctx) {
    ctx.body = 'destroy user';
  }
}
