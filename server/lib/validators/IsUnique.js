import { registerDecorator, ValidatorConstraint } from 'class-validator';
import { getRepository } from 'typeorm';

@ValidatorConstraint({ async: true })
class IsUniqueConstraint {
  /* eslint-disable-next-line */
  async validate(value, args) {
    const { object, property, targetName } = args;

    const repository = getRepository(targetName);
    const [entity, count] = await repository.findAndCount({ [property]: value });

    if (object.id && count > 0) {
      return object.id === entity[0].id;
    }

    return count === 0;
  }
}

export default (validationOptions = {}) => (object, propertyName) => {
  registerDecorator({
    target: object.constructor,
    propertyName,
    options: validationOptions,
    constraints: [],
    validator: IsUniqueConstraint,
  });
};
