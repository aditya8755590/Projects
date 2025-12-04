import React from 'react'

import { useParams } from 'react-router-dom'


const User = () => {

    const {userid} = useParams()

  return (
    <div>User{userid} Funck YOU</div>
  )

}

export default User