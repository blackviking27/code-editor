"use client"

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/navigation'

const FormInput = ({ label = "", placeholder = "", val, setVal }) => {
  return (
    <section className="flex flex-col mt-5" >
      <label>{label}</label>
      <input className="mt-2 px-4 py-2  bg-gray-800  border-white rounded-md" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} />
    </section>
  )
}


export default function Home() {

  const [roomId, setRoomId] = useState("")
  const [name, setName] = useState("")
  const router = useRouter()

  const createNewRoom = () => {
    const id = uuid()
    setRoomId(id)
    toast.success("Room created")
  }

  const handleJoin = () => {
    if (roomId != "" && name != "") {
      let url = `/editor/${roomId}?user=${name}`
      router.push(url)
    } else {
      let msg = ""
      if (roomId == "") {
        msg = "Empty room id"
      } else {
        msg = "Enter a valid username"
      }
      toast(msg, {
        icon: "⚠️"
      })
    }
  }

  return (
    <main className="w-full h-screen flex justify-center items-center" >
      <div className="bg-gray-900 p-8 rounded-xl md:w-[40%]" >
        <div className="font-semibold text-center" >
          Join a room
        </div>
        <div>
          <FormInput label="Room id" placeholder="Enter room id" val={roomId} setVal={setRoomId} />
          <FormInput label="Name" placeholder="Enter name" val={name} setVal={setName} />
        </div>

        <button className="mt-5 text-center bg-green-500 w-full py-2 rounded-xl cursor-pointer hover:bg-green-700 transition-all duration-150" onClick={handleJoin} >Join</button>

        <div className="flex text-sm mt-8 justify-center">
          <p className="text-gray-400" >Need a new room?</p>
          <span className="text-green-500 underline cursor-pointer" onClick={createNewRoom} >&nbsp;Create</span>
          <Toaster />
        </div>
      </div>
    </main>
  )
}
