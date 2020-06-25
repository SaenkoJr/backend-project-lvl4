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
        validate: {
          isEmail: 'Некорректный адрес электронной почты',
          notEmpty: 'Необходимо заполнить поле',
          emailIsTaken: 'Такая почта уже используется',
          oldPasswordNotMatch: 'Неверный пароль',
          passwordNotMatch: 'Пароль не совпадает с новым',
        },
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось обновить',
          success: 'Пользователь успешно обновлен',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удален',
          hasCreatedTasks: 'Не удалось удалить пользователя. У вас остались созданные вами задачи',
          hasAssignedTasks: 'Не удалось удалить пользователя. У вас остались незавершенные задачи',
        },
        access: {
          denied: 'Для доступа необходимо авторизироваться',
        },
      },
      tasks: {
        validate: {
          notEmpty: 'Необходимо заполнить поле',
        },
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
        validate: {
          notEmpty: 'Необходимо заполнить поле',
          nameIsTaken: 'Такое имя уже используется',
        },
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус создан',
        },
        update: {
          error: 'Не удалось обновить',
          success: 'Статус обновлен',
        },
        delete: {
          error: 'Не удалось удалить статус',
          relationsError: 'Не удалось удалить статус. Статус используется',
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
        profile: 'Профиль',
        tasks: 'Задачи',
        statuses: 'Список статусов',
      },
    },
    mixins: {
      modal: {
        warning: 'Внимание',
        confirmMsg: 'Вы уверены что хотите продолжить ?',
        confirm: 'Подтвердить',
        close: 'Закрыть',
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
        list: {
          empty: 'Ни одного пользователя еще не зарегистрировано',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Эл. почта',
          password: 'Пароль',
          repeatedPassword: 'Повторите пароль',
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
          common: 'Общие',
          security: 'Безопасность',
          oldPassword: 'Введите старый пароль',
          newPassword: 'Введите новый пароль',
          repeatedPassword: 'Повторите пароль',
          changePassword: 'Изменить пароль',
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
          tags: 'Тэги:',
          empty: 'Ни одной задачи пока еще не создано',
          new: 'Добавить задачу',
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
          statusPlaceholder: 'Выбрать статус',
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
          statusPlaceholder: 'Выбрать статус',
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
          empty: 'Ни одного статуса пока еще не создано',
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
          greetings: 'Добро пожаловать!',
          description: 'Простое приложение, которое позволит организовать свою работу и сделать вас чуточку продуктивнее',
          signIn: 'Войти',
          signUp: 'Зарегистрироваться',
        },
      },
    },
  },
};
