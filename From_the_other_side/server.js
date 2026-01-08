import https from 'node:http'
const port=7004;
const server=https.createServer((req,res)=>{
    // res.statusCode=200
    // res.setHeader('content-Type','text/html')
    res.writeHead(200,{'Content-Type':'application/json'})
    res.end(JSON.stringify({message: 'The server is working'}))
})
server.listen(port,()=>console.log("server is listening on port "+port))

  

