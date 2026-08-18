export const successResponse = (data, meta = null) => ({
  success: true,
  data,
  ...(meta && { meta }),
  timestamp: new Date().toISOString()
});

export const paginatedResponse = (data, pagination) => ({
  success: true,
  data,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total_records: pagination.totalRecords,
    total_pages: Math.ceil(pagination.totalRecords / pagination.limit),
    has_next: pagination.page * pagination.limit < pagination.totalRecords,
    has_prev: pagination.page > 1
  },
  timestamp: new Date().toISOString()
});