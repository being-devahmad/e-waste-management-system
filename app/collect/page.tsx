'use client'
import { useState, useEffect } from 'react'
import { Trash2, MapPin, CheckCircle, Clock, ArrowRight, Camera, Upload, Loader, Calendar, Weight, Search } from 'lucide-react'
import { GoogleGenerativeAI } from "@google/generative-ai"

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


export default function exportWaste() {
    return (
        <>

        </>
    )
}