import path from 'path'
import dotenv from 'dotenv'
import { startDb, stopDb, createTables, deleteTables } from 'jest-dynalite'

beforeAll(() => {
  dotenv.config({ path: path.join(__dirname, '../.env') })
  process.env.IS_OFFLINE = true
  process.env.DYNAMODB_TABLE = 'majo21-backend-db-dev'
  process.env.DYNAMODB_ENDPOINT_LOCAL = 'http://localhost:8001'
  startDb()
})

beforeEach(createTables)
afterEach(deleteTables)
afterAll(stopDb)
