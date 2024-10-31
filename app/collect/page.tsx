'use client'
import { useState, useEffect } from 'react'
import { Trash2, MapPin, CheckCircle, Clock, ArrowRight, Camera, Upload, Loader, Calendar, Weight, Search } from 'lucide-react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getUserByEmail, getWasteCollectionTasks } from '../../utils/db/actions'
import toast from 'react-hot-toast'

const [loading, setLoading] = useState(false)
const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null)
const [searchTerm, setSearchTerm] = useState("")
const [currentPage, setCurrentPage] = useState(1)
const [user, setUser] = useState<{
    id: number,
    email: string,
    name: string,
} | null>(null)

useEffect(() => {
    const fetchUserAndTask = async () => {
        try {
            const userEmail = localStorage.getItem("userEmail")
            if (userEmail) {
                const fetchedUser = await getUserByEmail(userEmail)
                if (fetchedUser) {
                    setUser(fetchedUser)
                } else {
                    toast.error('User not logged in. Please logged In')
                }

                const fetchedTasks = await getWasteCollectionTasks()
            }
        } catch (error) {

        }

        fetchUserAndTask()
    }
}, [])

// Make sure to set your Gemini API key in your environment variables
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

type CollectionTask = {
    id: number,
    location: string,
    wasteType: string,
    amount: string,
    status: 'pending' | 'in_progress' | 'completed' | 'verified',
    data: string,
    collectorId: number | null
}

const ITEMS_PER_PAGE = 5


export default function CollectWaste() {

    useEffect(() => {
        const fetchUSerAndTask = async () => {
            setLoading(true)
        }
    }, [])

    return (
        <>
            <div>
                COllect Waste
            </div>
        </>
    )
}