export const parsePaginationQuery = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const sort = req.query.sort || '-created_at';

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
    sort
  };

  next();
};