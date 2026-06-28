const rawBody = (req, res, next) => {
  let data = [];
  req.on('data', (chunk) => {
    data.push(chunk);
  });
  req.on('end', () => {
    req.rawBody = Buffer.concat(data);
    next();
  });
};

export default rawBody;