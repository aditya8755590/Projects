import React from 'react'

import { useParams } from 'react-router-dom'


const User = () => {

    const {userid} = useParams()

  return (
    

    <div>User {userid}
     <div className="box"></div>
    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/HhzZ_hvyUyA?si=Ubj22mPMjEjCpUIp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/IpFX2vq8HKw?si=EEY12qL62dVu0muP&amp;start=4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
    
    
  )

}

export default User