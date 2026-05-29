// import React from 'react'

import ManagerLogin from "./ManagerLogin";
import AddSpare from './AddSPare'

export default function Home() {
  return (
    <div style={{display: "flex", flexDirection: "row", padding: "12px", gap: "60px", paddingLeft: "250px"}}>
      <ManagerLogin />
      <AddSpare />
    </div>
  )
}
