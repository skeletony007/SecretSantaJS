/**
 * Simple way to validate JSON using minimal JSON Schema inspired by JSON
 * Schema (https://json-schema.org).
 * @function
 * @param {JSON} object The JSON to be validated.
 * @param {JSON} schema The JSON Schema to be validated against.
 * @returns {boolean} True or throws an error.
 * @link https://en.wikipedia.org/wiki/JSON#JSON_Schema
 * @link https://json-schema.org
 */
function validateJson(object, schema) {
  const errors = new Array();
  const errorsLengthLimit = 30;

  function error(message) {
    errors.push(`Validate JSON ${message}`);
  }

  const validJsonSchemaTypes = new Set(['object', 'array', 'string', 'number', 'null']);

  function throwUnknownType(typeName) {
    error(`encountered unknown ${typeName} type (stopping)`);
    throw new Error(errors.join('\n'));
  }

  /**
   * $ node # Intuitively [] should be 'array'
   * > typeof []
   * 'object'
   **/
  function getJsonSchemaTypeFromObject(object) {
    if (Array.isArray(object)) return 'array';
    if (object === null) return 'null';
    const javascriptType = typeof object;
    if (!validJsonSchemaTypes.has(javascriptType)) throwUnknownType();
    return javascriptType;
  }

  function getJsonSchemaTypeFromSchema(schema) {
    const schemaTypeFromObject = getJsonSchemaTypeFromObject(schema);
    const schemaTypeFromSchema = schemaTypeFromObject === 'string' ? schema : schemaTypeFromObject;
    if (!validJsonSchemaTypes.has(schemaTypeFromSchema)) throwUnknownType();
    return schemaTypeFromSchema;
  }

  function validate(object, schema, path = '.') {
    if (errors.length >= errorsLengthLimit) {
      error(`number of errors exceeds ${errorsLengthLimit} (stopping)`);
      throw new Error(errors.join('\n'));
    }

    function pathError(path, message) {
      error(`key ${path} ${message}`);
    }

    const objectType = getJsonSchemaTypeFromObject(object);
    const schemaType = getJsonSchemaTypeFromSchema(schema);

    function typeError() {
      pathError(path, `only accepts type ${schemaType}`);
    }

    switch (schemaType) {
      case 'object':
        if (objectType !== 'object') {
          typeError();
          break;
        }
        if (schema === 'object') break;
        for (const key in schema) {
          if (!object.hasOwnProperty(key)) {
            pathError(`${path}.${key}`, 'missing!');
            continue;
          }

          validate(object[key], schema[key], path === '.' ? `.${key}` : `${path}.${key}`);
        }
        break;

      case 'array':
        if (objectType !== 'array') {
          typeError();
          break;
        }
        if (schema === 'array') break;
        for (let i = 0; i < object.length; i++) {
          validate(object[i], schema[0], `${path}[${i}]`);
        }
        break;

      case objectType:
        // do nothing
        break;

      default:
        typeError();
        break;
    }
  }

  validate(object, schema);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  return true;
}
