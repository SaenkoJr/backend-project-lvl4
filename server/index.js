import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Rollbar from 'rollbar';
import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyTypeORM from 'fastify-typeorm';
import fastifyErrorPage from 'fastify-error-page';
import fastifySecureSession from 'fastify-secure-session';
import fastifyFormBody from 'fastify-formbody';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyFlash from 'fastify-flash';
import fastifyReverseRoutes from 'fastify-reverse-routes';
import pointOfView from 'point-of-view';
import Pug from 'pug';
import i18next from 'i18next';
import ru from './locales/ru';

import ormconfig from '../ormconfig';
import webpackConfig from '../webpack.config';
import getHelpers from './helpers';
import addRoutes from './routes';
import User from './entity/User';
import Guest from './entity/Guest';

const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'test';
const isDevelopment = !isProduction;

const setupViews = (app) => {
  const { devServer } = webpackConfig;
  const devHost = `http://${devServer.host}:${devServer.port}`;
  const domain = isDevelopment ? devHost : '';
  const helpers = getHelpers(app);

  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    defaultContext: {
      assetPath: (filename) => `${domain}/assets/${filename}`,
      ...helpers,
    },
    includeViewExtension: true,
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setupStaticAssets = (app) => {
  const pathPublic = isDevelopment
    ? path.join(__dirname, '..', 'dist', 'public')
    : path.join(__dirname, '..', 'public');

  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const setupLocalization = () => {
  i18next.init({
    lng: 'ru',
    fallbackLng: 'en',
    resources: {
      ru,
    },
  });
};

const addHooks = (app) => {
  app.decorateRequest('currentUser', null);
  app.decorateRequest('signedIn', false);

  app.addHook('preHandler', async (req) => {
    const userId = req.session.get('userId');
    if (userId) {
      req.currentUser = await User.findOne(userId);
      req.signedIn = true;
    } else {
      req.currentUser = new Guest();
    }

    if (req.body) {
      req.log.info({ body: req.body }, 'parsed body');
    }

    /* eslint-disable-next-line */
    return;
  });
};

const registerPlugins = (app) => {
  app.register(fastifyErrorPage);
  app.register(fastifyReverseRoutes);
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_SECRET,
    salt: crypto.randomBytes(16),
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyFormBody);
  app.register(fastifyFlash);
  app.register(fastifyMethodOverride);
  app.register(fastifyTypeORM, ormconfig)
    .after((err) => {
      if (err) throw err;
    });
};

const setupErrorHandler = (app) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.setErrorHandler(async (err, req, reply) => {
    rollbar.error(err, req);

    reply.send(err);
  });
};

export default () => {
  dotenv.config();

  const app = fastify({
    logger: {
      level: isTesting ? 'warn' : 'info',
      prettyPrint: isDevelopment,
      timestamp: !isDevelopment,
      base: null,
    },
  });

  if (isProduction) {
    setupErrorHandler(app);
  }

  registerPlugins(app);

  setupLocalization();
  setupViews(app);
  setupStaticAssets(app);
  addRoutes(app);
  addHooks(app);

  return app;
};
