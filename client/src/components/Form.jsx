import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Form = () => {

    const { getToken, axios, navigate, setSearchedCities}= useAppContext();
    const [destination,setDestination]= useState('');
    
    const onSearch= async (e)=>{
            e.preventDefault();
            navigate(`/rooms?destination=${destination}`)
            
            //calling API to save recent searched cities
            await axios.post('/api/user/store-recent-search', {recentSearchedCities: destination}, {headers: {Authorization: `Bearer ${await getToken()}`}});

            //adding destination to recent searched cities
            setSearchedCities((prevCities)=>{
                const updatedCities=[...prevCities, destination];
                if(updatedCities.length>3){
                    updatedCities.shift();
                }
                return updatedCities;
            })
        
    }

    return (
        <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="Calender" className='h-4' />
                    <label htmlFor="destinationInput">Destination</label>
                </div>
                <input onChange={(event)=> setDestination(event.target.value)} value={destination} list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
                <datalist id='destinations'>
                    {cities.map((city,index)=>{
                        return(
                            <option key={index} value={city} />
                        )
                    })}
                </datalist>
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="Calender" className='h-4' />
                    <label htmlFor="checkIn">Check in</label>
                </div>
                <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="Calender" className='h-4' />
                    <label htmlFor="checkOut">Check out</label>
                </div>
                <input id="checkOut" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                <label htmlFor="guests">Guests</label>
                <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
            </div>

            <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                <img src={assets.searchIcon} alt="Magnifying Glass" className='h-7'/>
                <span>Search</span>
            </button>
        </form>
    );
}


export default Form