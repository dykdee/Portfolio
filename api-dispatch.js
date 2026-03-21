const app = require('./server');

function dispatch(targetPath) {
  return (req, res) => {
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex === -1 ? '' : req.url.slice(queryIndex);

    req.url = `${targetPath}${query}`;
    return app(req, res);
  };
}

module.exports = { dispatch };
