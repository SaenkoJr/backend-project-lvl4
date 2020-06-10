import welcome from './welcome';
import users from './users';
import session from './session';

const contollers = [
  welcome,
  users,
  session,
];

export default (app) => contollers.forEach((f) => f(app));
