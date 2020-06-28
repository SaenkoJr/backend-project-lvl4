import welcome from './welcome';
import users from './users';
import session from './session';
import taskStatuses from './statuses';
import tasks from './tasks';

const controllers = [
  welcome,
  users,
  taskStatuses,
  session,
  tasks,
];

export default (app) => controllers.forEach((f) => f(app));
