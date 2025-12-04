import React from 'react'
const Github = () => {
  const [data,setdata]=React.useState([]);
   
React.useEffect(()=>{
    fetch("https://api.github.com/users/aditya8755590")
    .then(res=>res.json())
    .then(data=>{
        setdata(data)
    })
},[])

  return (
    <div>Github followers {data.followers}
     <img src={data.avatar_url} alt="git picture " />
     <h1>{data.public_repos}</h1>
     </div>


  )
}

export default Github