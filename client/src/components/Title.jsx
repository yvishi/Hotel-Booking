import React from 'react'

const Title = ({title, subtitle, align, font}) => {
  return (
    <div className={`flex flex-col justify-center items-center text-center ${align=='left' && "md:items-start md:text-left"}`}>
        <h1 className={`text-2xl md:text-[50px] ${font || 'font-playfair'} `}>{title}</h1>
        <p className={` text-gray-500/90 text-sm md:text-base max-w-174 mt-2 `}>{subtitle}</p>
        
    </div>
  )
}

export default Title
