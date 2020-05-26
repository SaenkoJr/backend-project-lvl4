import _ from 'lodash';
import i18next from 'i18next';

export default (app) => ({
  route(name) {
    return app.reverse(name);
  },
  t(key) {
    return i18next.t(key);
  },
  _,
  getAlertClass(type) {
    switch (type) {
      case 'error':
        return 'danger';
      case 'info':
        return 'info';
      default:
        throw new Error(`Unknown type: '${type}'`);
    }
  },
});
