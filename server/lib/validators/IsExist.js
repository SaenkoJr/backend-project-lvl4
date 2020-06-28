import { registerDecorator, ValidatorConstraint } from 'class-validator';
import { getRepository } from 'typeorm';

@ValidatorConstraint({ async: true })
class IsExistConstraint {
  /* eslint-disable-next-line */
  async validate(value, args) {
    const { property, targetName } = args;

    const repository = getRepository(targetName);
    const count = await repository.count({ [property]: value });

    return count > 0;
  }
}

export default (validationOptions = {}) => (object, propertyName) => {
  registerDecorator({
    target: object.constructor,
    propertyName,
    options: validationOptions,
    constraints: [],
    validator: IsExistConstraint,
  });
};
