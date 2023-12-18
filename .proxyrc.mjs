import serveStatic from 'serve-static';

export default function (app) {
  // Redirect config queries to the static config folder
  app.use('/config', serveStatic('./config'));
};
