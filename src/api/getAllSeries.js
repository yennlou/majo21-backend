import db from '../utils/db'
import { success } from '../utils/response'

const main = async (event) => {
  const seriesList = await db.getAllSeries()
  return success(seriesList)
}

export {
  main
}
