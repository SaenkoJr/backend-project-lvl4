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
          emailIsTaken: 'Такая почта уже используется',
        },
        update: {
          error: 'Не удалось обновить',
          success: 'Пользователь успешно обновлен',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удален',
        },
        access: {
          denied: 'Для доступа необходимо авторизироваться',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача создана',
        },
        update: {
          error: 'Не удалось обновить',
          success: 'Задача обновлена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача удалена',
        },
        access: {
          denied: 'Для доступа необходимо авторизироваться',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус создан',
          nameIsTaken: 'Такое имя уже существует',
        },
        update: {
          error: 'Не удалось обновить',
          success: 'Статус обновлен',
          nameIsTaken: 'Такое имя уже существует',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус удален',
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
        tasks: 'Задачи',
        statuses: 'Список статусов',
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
      tasks: {
        list: {
          all: 'Выбрать все',
          my: 'Мои задачи',
          filter: 'Применить фильтры',
          creator: 'Автор',
          assignedTo: 'Исполнитель',
          status: 'Статус',
          createdAt: 'Дата создания',
          lastUpdate: 'Дата последнего обновления',
          new: 'Добавить статус',
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          title: 'Создать задачу',
          name: 'Название',
          description: 'Описание',
          status: 'Статус',
          assignedTo: 'Исполнитель',
          tags: 'Тэги',
          tagsPlaceholder: 'Перечислите тэги через запятую',
          submit: 'Создать',
        },
        update: {
          title: 'Обновить задачу',
          name: 'Название',
          description: 'Описание',
          status: 'Статус',
          assignedTo: 'Исполнитель',
          tags: 'Тэги',
          tagsPlaceholder: 'Перечислите тэги через запятую',
          submit: 'Применить',
        },
      },
      statuses: {
        list: {
          id: 'ID',
          name: 'Название',
          createdAt: 'Дата создания',
          actions: 'Действия',
          new: 'Добавить статус',
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          title: 'Создать',
          name: 'Название',
          submit: 'Добавить',
        },
        update: {
          title: 'Редактировать',
          name: 'Название',
          submit: 'Сохранить',
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
