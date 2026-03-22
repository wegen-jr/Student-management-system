import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from "react-toastify";
import  Swal  from "sweetalert2";
export default function RegisterRooms() {
  const [rooms, setRooms] = useState([])
  const [block, setBlock] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [search, setSearch] = useState('')

  // ✅ Fetch rooms
  const fetchRooms = async (query = '') => {
    try {
      const res = await fetch(`http://localhost/sms/backend/admin/classRooms.php?search=${query}`, {
        credentials: 'include'
      })

      const data = await res.json() // ✅ FIXED
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setRooms([])
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  // ✅ Search
  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    fetchRooms(value)
  }

  // ✅ Add room
    const handleAddRoom = async (e) => {
    e.preventDefault()
    if (!block || !roomNumber) return

    try {
        const res = await fetch('http://localhost/sms/backend/admin/classRooms.php', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ block, roomNumber: parseInt(roomNumber) }) // ✅ force integer
        })

        const data = await res.json()

        if (data.success) {
        toast.success(data.message)
        } else {
        toast.error(data.error || "Something went wrong")
        }

        fetchRooms()
        setBlock('')
        setRoomNumber('')
    } catch (err) {
        console.error(err)
        toast.error("Server error")
    }
    }

  // ✅ Delete room
  const handleDelete = async (id) => {
      Swal.fire({ 
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      }).then(async(result) => {
        if (result.isConfirmed) {
          toast.success("Deleting class rooms...");
          await deleteRoom(id);
        }
        if (result.isDismissed) {
          toast.info("Delete cancelled");
          return;
        }
      });
  }
  const deleteRoom=async(id)=>{
    try {
      const res = await fetch(`http://localhost/sms/backend/admin/classRooms.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message)
        fetchRooms()
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className='bg-gray-200 h-screen p-6'>
      <p className='text-3xl text-blue-900 font-bold mb-4'>
        class room management
      </p>

      <ToastContainer 
        autoClose={1000}
      />

      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder='search class rooms'
        className='w-64 px-3 py-2 rounded-full border border-blue-400 bg-white'
      />

      {/* Add Room */}
      <div className='bg-white mt-4 p-4 rounded shadow'>
        <p className='font-bold'>Add class rooms</p>

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <input
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className='border p-2 rounded'
            placeholder='Block Number'
          />
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className='border p-2 rounded'
            placeholder='Room Number'
          />
        </div>

        <button
          onClick={handleAddRoom}
          className='bg-blue-900 text-white px-4 py-2 mt-4 rounded'
        >
          Add Room
        </button>
      </div>

      {/* Table */}
      <div className='mt-5 bg-white p-4 rounded shadow h-72'>
          <p className='font-bold mb-3'>Class Rooms</p>
          <div className='max-h-54 overflow-y-auto'>
              <table className='w-full border'>
                <thead className='bg-blue-900 text-white'>
                  <tr>
                    <th className='p-2'>ID</th>
                    <th>Block</th>
                    <th>Room</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody className=''>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <tr key={room.id}>
                        <td className='p-2 text-center'>{room.id}</td>
                        <td className='p-2 text-center'>Block {room.block}</td>
                        <td className='p-2 text-center'>Room {room.room}</td>
                        <td className='p-2 text-center'>{room.year}</td>
                        <td className='p-2 text-center'>{room.semister}</td>
                        <td>
                          <button
                            onClick={() => handleDelete(room.id)} // ✅ FIXED
                            className="bg-red-600 text-white px-2 py-1 rounded text-center"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className='text-center p-4'>
                        No rooms found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}