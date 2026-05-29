// import React from 'react'

import axios from "axios";
import { useState } from "react"

export default function ManagerLogin() {
    const [name,setName] = useState('');
    const [category,setCategory] = useState ('')
    const [quantity,setQuantity] = useState()
    const [unitprice, setUnitprice] = useState()
    // const [totalprice,setTotalprice] = useState(0)

    const handleAdd = ((e) => {
        e.preventDefault();
        const sparedata = { 
             name, category, quantity, unitprice, totalprice
    };
        try {
            axios.post('https://127.0.0.1/5000/addspare', sparedata)
            alert("Spare Item Is now Added successfully!");
        } catch (err) {
          alert("Failed to add an item,try again!", err);
        }
    });
    const totalprice = quantity * unitprice
  return (
    <div>
        <h5>Add spare key to the Management system</h5>
      <form onSubmit={handleAdd} style={{border: "1px solid green"}}>
        <p>Name</p>
        <input type="text" placeholder= " enter your name of item here" value={name} onChange={(e) => setName(e.target.value)} /> <br /><br />
        <p>Category</p>
        <input type="text" placeholder="Enter the category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <br /><br />
        <p>Quantity</p>
        <input type="number" placeholder="Enter the Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <br /><br />
        <p>Unit Price</p>
        <input type="number" placeholder="Enter the unit price /kg" value={unitprice} onChange={(e) => setUnitprice(e.target.value)} />
        <br />
        <p>total Price:{totalprice}</p>
        <button type="submit">Add item</button>

      </form>
    </div>
  )
}
