#! /usr/bin/env node

import getApp from '../index';

const port = process.env.PORT || 5000;
const address = '0.0.0.0';

const app = getApp();

app.listen(port, address)
  .then(() => app.log.info(`Server is running on port: ${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
