import http from 'node:http';
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
if(req.url=="/api"&&req.method==='GET'){
   res.end('today is christmas fuck you ')}
   else{
    res.end('lund lai lo nahi to api dalo bas ');
   }

})

server.listen(port,()=>{
    console.log(`Server is listening on port  ${port}....`)
})
