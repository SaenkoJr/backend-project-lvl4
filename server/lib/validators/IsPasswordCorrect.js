import _ from 'lodash';
import { registerDecorator, ValidatorConstraint } from 'class-validator';
import { getRepository } from 'typeorm';

@ValidatorConstraint({ async: true })
class IsPasswordCorrect {
  /* eslint-disable-next-line */
  async validate(_value, args) {
    const { targetName, object } = args;
    const { email, passwordDigest } = object;

    const repository = getRepository(targetName);
    const entity = await repository.findOne({ email });

    return _.get(entity, 'passwordDigest', '') === passwordDigest;
  }
}

export default (validationOptions = {}) => (object, propertyName) => {
  registerDecorator({
    target: object.constructor,
    propertyName,
    options: validationOptions,
    constraints: [],
    validator: IsPasswordCorrect,
  });
};
