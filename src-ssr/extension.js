/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * All content of this folder will be copied as is to the output folder. So only import:
 *  1. node_modules (and yarn/npm install dependencies -- NOT to devDependecies though)
 *  2. create files in this folder and import only those with the relative path
 *
 * Note: This file is used for both PRODUCTION & DEVELOPMENT.
 * Note: Changes to this file (but not any file it imports!) are picked up by the
 * development server, but such updates are costly since the dev-server needs a reboot.
 */
const bodyParser = require('body-parser')
const mongoAccessRouter = require('./api/mongoAccess')
// const apiRouter = require('./api/api')
const ConnectionPool = require('./util/connectionPool')

module.exports.extendApp = ({
  app,
  //  ssr
}) => {
  /*
     Extend the parts of the express app that you
     want to use with development server too.

     Example: app.use(), app.get() etc
  */
  app.locals.connectionPool = new ConnectionPool()
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use((req, res, next) => {
    req.getMongoClient = async () => {
      const { assignid } = req.headers
      const connectionPool = req.app.locals.connectionPool
      const client = await connectionPool.getMongoClient(assignid)
      return client
    }
    req.createMongoClient = async serverInfo => {
      const { assignid } = req.headers
      const connectionPool = req.app.locals.connectionPool
      const client = await connectionPool.createMongoClient(assignid, serverInfo)
      return client
    }
    req.getMongoClientWithInfo = async serverInfo => {
      const { assignid } = req.headers
      const connectionPool = req.app.locals.connectionPool
      const { client, connOptions } = await connectionPool.getMongoClientWithInfo(assignid, serverInfo)
      return { client, connOptions }
    }
    next()
  })
  app.use('/api', mongoAccessRouter)
  // app.use('/api', apiRouter)
}
