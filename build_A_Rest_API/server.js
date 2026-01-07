import http from 'node:http';
import{data} from './data/data.js'
import { sendJSONResponse } from './utils/sendJSONResponse.js'
import { getDataByPathParams } from './utils/getDataByPathParams.js'
import { getDataByQueryParams } from './utils/getDataByQueryParams.js'
const port=3007;


const server=http.createServer((req,res)=>{
//    if(req.method==='GET'){
//     res.write('This is some data \n')
//    res.write('This is some more data \n')
//     res.end("hello ji request recive ho gai hai !!")
//    }
//    else{
//     req.statusCode=404
//     res.end("hello koi input nahai hai")
//    }
// if(req.url=="/api"&&req.method==='GET'){
//    res.end('today is christmas')}
//    else{
//     res.end('api dalo bas ');
//    }

// 
const urlObj=new URL(req.url,`https://${req.headers.host}`)
 const queryObj = Object.fromEntries(urlObj.searchParams)


  if (urlObj.pathname=== '/api' && req.method === 'GET') {
    
    let filteredDestinations = destinations
     
    console.log(queryObj);
    // update filteredDestinations

    sendJSONResponse(res, 200, filteredDestinations)

  } else if (req.url.startsWith('/api/continent') && req.method === 'GET') {

    const continent = req.url.split('/').pop()
    const filteredData = getDataByPathParams(filteredDestinations, 'continent', continent)
    sendJSONResponse(res, 200, filteredData)

  } else if (req.url.startsWith('/api/country') && req.method === 'GET') {

    const country = req.url.split('/').pop()
    const filteredData = getDataByPathParams(filteredDestinations, 'country', country)
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
