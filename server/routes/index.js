import welcome from './welcome';
import users from './users';
import session from './session';
import taskStatuses from './statuses';
import tasks from './tasks';

const contollers = [
  welcome,
  users,
  taskStatuses,
  session,
  tasks,
];

export default (app) => contollers.forEach((f) => f(app));
