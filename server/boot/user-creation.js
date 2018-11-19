'use strict';

module.exports = function(app) {
  const UserModel = app.models.User;
  const defaultData = {
    name: 'Jesús Apodaca',
    email: 'apodaca@test.com',
    password: '12345678',
  };
  const createDefaultUser = (argument) => {
    UserModel.create(defaultData, function(err, user) {
      if (err) throw err;
      else console.log('...Default user created');
      const ListModel = app.models.List;
      const defaultListData = {
        name: 'All',
        userId: user.id,
      };

      const createListDefault = (argument) => {
        ListModel.create(defaultListData, function(err, user) {
          if (err) throw err;
          else console.log('...Default list created');
        });
      };

      ListModel.findOne({}, function(err, user) {
        if (err) throw err;
        if (!user) createListDefault();
      });
    });
  };

  UserModel.findOne({}, function(err, user) {
    if (err) throw err;
    if (!user) createDefaultUser();
  });
};
