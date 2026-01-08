const fetchUser=(id)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            const users={1:{id:1,name:'John Doe',age:30},2:{id:2,name:'Jane Smith',age:25},3:{id:3,name:'Alice Johnson',age:28}}
            user=users[id]
              if(user){
             resolve(user)
        } else {
            reject(new Error('User not found'))
        }
        },1000)
    })
}
// by using .then and catch
fetchUser(2)
.then(user=>{
    console.log(`User ID:${user.id}, Name:${user.name}, Age:${user.age}`)
})
.catch(error=>{
    console.error(error.message)
})

// by using async await
// Async function to fetch and display user details
const displayUser=async(id)=>{
    try{
        const user=await fetchUser(id)
        console.log(`User ID:${user.id}, Name:${user.name}, Age:${user.age}`)
    }catch(error){
        console.error(error.message)
    }
}
displayUser(1)