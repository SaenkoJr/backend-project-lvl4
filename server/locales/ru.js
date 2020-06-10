module.exports = {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        access: {
          denied: 'Для доступа необходимо авторизироваться',
        },
      },
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        settings: 'Настройки',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
          email: 'Эл. почта',
          password: 'Пароль',
        },
      },
      users: {
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Эл. почта',
          password: 'Пароль',
        },
        user: {
          id: 'ID',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Эл. почта',
          createdAt: 'Дата регистарции',
        },
        settings: {
          settings: 'Настройки',
          update: 'Обновить',
          delete: 'Удалить профиль',
        },
      },
      welcome: {
        index: {
          hello: 'Hello there!',
        },
      },
    },
  },
};
