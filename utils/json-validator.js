/**
 * @function
 * @param {JSON} json The JSON to be validated.
 * @param {JSON} schema The JSON Schema to be validated against.
 * @returns {boolean} True or throws an error.
 * @description Simple way to validate JSON using a JSON Schema.
 * @link https://en.wikipedia.org/wiki/JSON#JSON_Schema
 * @link https://json-schema.org
 */
function validateJson(json, schema) {
  const errors = new Array();

  function validate(obj, sch, path = '') {
    for (const key in sch) {
      const schemaType = sch[key];
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (!obj.hasOwnProperty(key)) {
        if (schemaType.required) {
          errors.push(`Validating JSON | Missing key: ${currentPath}`);
        }
        continue;
      }

      if (schemaType === null && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        errors.push(`Validating JSON | Key ${currentPath} is not allowed to be null, but is: ${JSON.stringify(value)}`);
      } else if (typeof schemaType === 'string') {
        if (typeof value !== schemaType && !(schemaType === 'null' && value === null)) {
          errors.push(`Validating JSON | Key ${currentPath} is of type ${typeof value}, expected ${schemaType}`);
        }
      } else if (typeof schemaType === 'object' && !Array.isArray(schemaType)) {
        validate(value, schemaType, currentPath);
      } else if (Array.isArray(schemaType)) {
        if (!Array.isArray(value)) {
          errors.push(`Validating JSON | Key ${currentPath} is expected to be an array`);
        } else {
          for (let i = 0; i < value.length; i++) {
            validate(value[i], schemaType[0], `${currentPath}[${i}].`);
          }
        }
      } else {
        errors.push(`Validating JSON | Unsupported schema definition for key ${currentPath}`);
      }
    }
  }

  validate(json, schema);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  return true;
}
