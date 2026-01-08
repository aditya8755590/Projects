import http from 'node:http';
import { getDataFromDB } from './dataBase//db.js'
import { sendJSONResponse } from './utils/sendJSONResponse.js'
import { getDataByPathParams } from './utils/getDataByPathParams.js'
import { getDataByQueryParams } from './utils/getDataByQueryParams.js'
const port=3007;
const server=http.createServer(async (req,res)=>{
const destinations = await getDataFromDB()
const urlObj=new URL(req.url,`https://${req.headers.host}`)
const queryObj = Object.fromEntries(urlObj.searchParams)


  if (urlObj.pathname===('/api/')&& req.method === 'GET') {
     
    console.log(queryObj);
    // update filteredDestinations
    let filteredDestinations = getDataByQueryParams(destinations,queryObj)
    sendJSONResponse(res, 200, filteredDestinations)

  } else if (req.url.startsWith('/api/continent') && req.method === 'GET') {
    const continent = req.url.split('/').pop()
    const filteredData = getDataByPathParams(destinations, 'continent', continent)
    sendJSONResponse(res, 200, filteredData)

  } else if (req.url.startsWith('/api/country') && req.method === 'GET') {
    const country = req.url.split('/').pop()
    const filteredData = getDataByPathParams(destinations, 'country', country)
    sendJSONResponse(res, 200, filteredData)
  }
  else {
    res.setHeader('Content-Type', 'application/json')
    sendJSONResponse(res, 404, ({
      error: "not found",
      message: "The requested route does not exist"
    }))
}
})
server.listen(port,()=>{
    console.log(`Server is listening on port  ${port}....`)
})
