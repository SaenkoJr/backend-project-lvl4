import { registerDecorator, ValidatorConstraint } from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
class MatchConstraint {
  /* eslint-disable-next-line */
  validate(value, args) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = args.object[relatedPropertyName];
    return value === relatedValue;
  }
}

export default (property, validationOptions) => (object, propertyName) => {
  registerDecorator({
    target: object.constructor,
    propertyName,
    options: validationOptions,
    constraints: [property],
    validator: MatchConstraint,
  });
};
