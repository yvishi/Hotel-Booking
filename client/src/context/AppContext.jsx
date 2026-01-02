import axios from 'axios';
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import {toast} from "react-hot-toast"
import { useEffect } from 'react';


axios.defaults.baseURL= import.meta.env.VITE_BACKEND_URL;

const AppContext= createContext();

export const AppProvider= ({children})=>{

    const currency= import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const {user} = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg,setShowHotelReg]= useState(false);
    const [searchedCities, setSearchedCities]= useState([]);
    const [rooms, setRooms]= useState([]);

    const fetchRooms= async ()=>{
        try {
            const {data}= await axios.get('/api/rooms/');
            if(data.success){
                setRooms(data.rooms);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchUser= async()=>{
        try {
            const {data}= await axios.get('/api/user', {headers: {Authorization: `Bearer ${await getToken()}`}})
            if(data){
                setIsOwner(data.role === "hotelOwner"? true: false);
                setSearchedCities(data.recentSearchedCities);
            }else{
                //Retry fetch after 5sec
                setTimeout(()=>{
                    fetchUser();
                },5000);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        if(user){
            fetchUser();
        }
    },[user]);

    useEffect(()=>{
        fetchRooms();
    },[]);

    const value={
        currency, navigate, user, getToken, isOwner, setIsOwner, showHotelReg, 
        setShowHotelReg, axios, searchedCities, setSearchedCities, rooms, setRooms
    }

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=>useContext(AppContext);