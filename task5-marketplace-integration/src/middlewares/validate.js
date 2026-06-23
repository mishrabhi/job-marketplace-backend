export default function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
      req.validated = validated;
      next();
    } catch (error) {
      error.status = 422;
      error.code = 'VALIDATION_ERROR';
      next(error);
    }
  };
}
