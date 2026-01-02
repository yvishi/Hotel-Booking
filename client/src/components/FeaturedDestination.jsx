import React from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'

const FeaturedDestination = () => {
    const {rooms, navigate}= useAppContext();
  return rooms.length>0 && (
    <div className='flex flex-col items-center px-6 md:px-16 lg-px-24 bg-slate-50 py-20'>
        
        <Title title={"Featured Destination"} subtitle={" Discover the best hotels and resorts for your next vacation,handpciked by our experts, to provide you the best and unparalled experience"}/>
        
        <div className='flex felx-wrap items-center justify-center gap-6 mt-20'>
            {rooms.slice(0,4).map((room,index)=>{
                return(
                    <HotelCard room={room} index={index} key={room._id}/>
                )
            })}
        </div>
        <button onClick={()=>{navigate('/rooms'); scrollTo(0,0)}} className='my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all cursor-pointer'>
            View All Destinations
        </button>
    </div>
  )
}

export default FeaturedDestination