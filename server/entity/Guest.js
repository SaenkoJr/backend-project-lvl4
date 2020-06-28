/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getFullName"] }] */

export default class Guest {
  isGuest = true;

  getFullName() {
    return 'Guest';
  }
}
