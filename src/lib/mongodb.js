import { MongoClient } from 'mongodb'

const options = {}

let client
let _clientPromise

export function getClientPromise() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Please add your Mongo URI to environment variables')
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  }

  if (!_clientPromise) {
    client = new MongoClient(uri, options)
    _clientPromise = client.connect()
  }
  return _clientPromise
}

// Lazy thenable proxy so `await clientPromise` works everywhere
// without executing connection logic or throwing at build/module-eval time.
const clientPromise = {
  then(onFulfilled, onRejected) {
    return getClientPromise().then(onFulfilled, onRejected)
  },
  catch(onRejected) {
    return getClientPromise().catch(onRejected)
  },
  finally(onFinally) {
    return getClientPromise().finally(onFinally)
  },
}

export async function getDb(dbName = 'villupuram_db') {
  const c = await clientPromise
  return c.db(dbName)
}

export default clientPromise
