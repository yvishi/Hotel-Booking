import React, { useMemo, useState } from 'react'
import Title from '../components/Title'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox= ({label, selected=false, onChange=()=>{ }})=>{
  return(
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input type="checkbox" checked={selected} onChange={(e)=>onChange(e.target.checked, label)}/>
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const RadioButton= ({label, selected=false, onChange=()=>{ }})=>{
  return(
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input type="radio" name="sortOption" checked={selected} onChange={()=>onChange(label)}/>
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const AllRooms = () => {

  const [searchParams, setSearchParams]= useSearchParams({});
  const {rooms, navigate, currency}= useAppContext();

  const [openFilters,setOpenFilters]=useState(false);
  const [selectedFilters, setSelectedFilters]= useState({
    roomType: [],
    priceRange: []
  });
  const [selectedSort, setSelectedSort]= useState('');

  const roomTypes=[
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite"
  ];

  const priceRange=[
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 3000"
  ]

  const sortOptions=[
    "Price Low to High",
    "Price High to Low",
    "Newest First"
  ]


  //handle filter and sort
  const handleFilterChange= (checked, value, type)=>{
    setSelectedFilters((prevFilters)=>{
      const updatedFilters={...prevFilters};
      if(checked){
        updatedFilters[type].push(value)
      }else{
        updatedFilters[type]= updatedFilters[type].filter((item)=>item!==value)
      }
      return updatedFilters;
    })
  }
  const handleSortChange= (sortOption)=>{
    setSelectedSort(sortOption);
  }

  //fun to check if room amtches selected room types
  const matchesRoomType= (room)=>{
    return selectedFilters.roomType.length===0 || selectedFilters.roomType.includes(room.roomType);
  }

  //fun to check if room matches the selected rpice range
  const matchesPriceRange= (room)=>{
    return selectedFilters.priceRange.length===0 || selectedFilters.priceRange.some(range=>{
      const [min,max]= range.split(' to ').map(Number);
      return room.pricePerNight >= min && room.pricePerNight <= max
    })
  }

  //function to sort rooms
  const sortRooms= (a,b)=>{
    if(selectedSort==="Price Low to High"){
      return assets.pricePerNight - b.pricePerNight;
    }
    if(selectedSort==="Price High to Low"){
      return b.pricePerNight - assets.pricePerNight;
    }
    if(selectedSort==="Newest First"){
      return new Date(b.createdAt) - new Date(assets.createdAt);
    }
  }

  //Filter Destination
  const filterDestination= (rooms)=>{
    const destination= searchParams.get('destination');
    if(!destination){
      return true;
    }
    return rooms.hotel.city.toLowerCase().includes(destination.toLowerCase());
  }

  //filter and sort based on selected filters and sort option
  const filteredRooms= useMemo(()=>{
    return rooms.filter(room=> matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room).sort(sortRooms))
  },[rooms, selectedFilters, selectedSort, searchParams])

  //Clear All Filters
  const clearFilters=()=>{
    setSelectedFilters({
      roomType: [],
      priceRange: []
    })
    setSelectedSort('');
    setSearchParams({});
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/* Left Side */}
        <div>
          <Title title='Hotel Rooms' subtitle='Take advantage of our wide range of hotel rooms, designed to meet your needs and preferences' align='left' />
          {rooms.map((room)=>{
            return(
              <div key={room._id} className='mt-12 flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0'>
                <img onClick={()=>{navigate(`/rooms/${room._id}`); scrollTo(0,0)}} src={room.images[0]} alt="room-image" title='View Room Details' className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer' />
                {/* Text info */}
                <div className='md:w-1/2 flex flex-col gap-2'>
                  <p className='text-gray-500'>{room.hotel.city}</p>
                  <p onClick={()=>{navigate(`/rooms/${room._id}`); scrollTo(0,0)}} className='text-gray-800 text-3xl font-playfair cursor-pointer'>{room.hotel.name}</p>
                  {/* Rating */}
                  <div className='flex items-center'>
                    <StarRating rating={room.rating}/>
                    <p className='ml-2'>200+ reviews</p>
                  </div>
                  {/* Address */}
                  <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                    <img src={assets.locationIcon} alt="location-icon" />
                    <span>{room.hotel.address}</span>
                  </div>
                  {/* amenities */}
                  <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                    {room.amenities.map((item,index)=>{
                      return(
                        <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                          <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                          <p className='text-sm'>{item}</p>
                        </div>
                      )
                    })}
                  </div>
                  {/* price */}
                  <div>
                    <p className='text-xl font-medium text-gray-700'>${room.pricePerNight}/night</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* Right Side */}
        <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16'>
          <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && 'border-b'}`}>
            <p className='text-base font-medium text-gray-800'>FILTERS</p>
            <div className='text-xs cursor-pointer'>
              <span onClick={()=>setOpenFilters(!openFilters)} className='lg:hidden'>{openFilters ? 'HIDE' : 'SHOW'}</span>
              <span className='hidden lg:block'>CLEAR</span>
            </div>
          </div>
          {/* Filter Options */}
          <div className={`${openFilters? 'h-auto':'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
            <div className='px-5 pt-5'>
              <p className='font-medioum text-gray-800 pb-2'>Popular Filters</p>
              {roomTypes.map((room,index)=>{
                return(
                  <CheckBox key={index} label={room} selected={selectedFilters.roomType.includes(room)} onChange={(checked)=>handleFilterChange(checked,room,'roomType')} />
                )
              })}
            </div>
            <div className='px-5 pt-5'>
              <p className='font-medioum text-gray-800 pb-2'>Price Range</p>
              {priceRange.map((range,index)=>{
                return(
                  <CheckBox key={index} label={`$${range}`} />
                )
              })}
            </div>
            <div className='px-5 pt-5 pb-7'>
              <p className='font-medioum text-gray-800 pb-2'>Sort By</p>
              {sortOptions.map((option,index)=>{
                return(
                  <RadioButton key={index} label={option} />
                )
              })}

            </div>
          </div>
        </div>
    </div>
  )
}

export default AllRooms