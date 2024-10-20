'use client'

import { useState, useEffect, useCallback } from "react"
import { MapPin, Upload, CheckCircle, Loader } from "lucide-react";
import { Button } from "../../components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StandaloneSearchBox, GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { Libraries } from "@react-google-maps/api";
import toast from "react-hot-toast";
import { createReport, getRecentReports, getUserByEmail } from "../../utils/db/actions";
import { useRouter } from "next/navigation";

const geminiApiKey = process.env.GEMINI_API_KEY as any
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY as any

const libraries: Libraries = ['places']


export default function ReportPage() {
    const [user, setUser] = useState('')
    const router = useRouter()
    const [reports, setReports] = useState<Array<{
        id: number;
        location: string;
        wasteType: string;
        amount: string;
        createdAt: string;
    }>>([])

    const [newReport, setNewReport] = useState({
        location: "",
        type: "",
        amount: ""
    })

    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failure'>('idle')
    const [verificationResult, setVerificationResult] = useState<{
        wasteType: string,
        quantity: string,
        confidence: number
    } | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        libraries: libraries,

    })

    const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
        setSearchBox(ref)
    }, [])

    const onPlaceCanged = () => {
        if (searchBox) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0]
                setReports(prev => ({
                    ...prev,
                    location: place.formatted_address || "",
                }))
            }
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewReport({ ...newReport, [name]: value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e?.target?.result as string)
            }
            const result = reader.readAsDataURL(selectedFile)
            console.log("result-->", result)
            console.log("reader--->", reader)
        }
    }

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file)
        })
    }

    const handleVerify = async () => {
        if (!file) return;
        setVerificationStatus('verifying')

        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash'
            })
            const base64Data = await readFileAsBase64(file)

            const imageParts = [
                {
                    inlineData: {
                        data: base64Data.split(',')[1],
                        mimeType: file.type
                    }
                }
            ]
            const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
            1. The type of waste (e.g., plastic , paper , glass , metal , organic)
            2. An estimate of the quantity or amount (in kg or liters)
            3. Your confidence level in this assesment (as a percentage)
            
            Respond in JSON format like this:
            {
                "wasteType": "type of waste",
                "quantity": "estimated quantity with unit",
                "confidence": confidence level as a number between 0 and 1
            }`;

            const result = await model.generateContent([prompt, ...imageParts])
            const response = await result.response
            const text = response.text();

            try {
                const parsedResult = JSON.parse(text)
                if (parsedResult.wasteType && parsedResult.quantity && parsedResult.confidence) {
                    setVerificationResult(parsedResult)
                    setVerificationStatus('success')
                    setNewReport({
                        ...newReport,
                        type: parsedResult.wasteType,
                        amount: parsedResult.amount
                    })
                } else {
                    console.error('Invalid verification results', parsedResult)
                    setVerificationStatus('failure')
                }
            } catch (error) {
                console.error('Failure to parse JSON response', error)
                setVerificationStatus('failure')
            }
        } catch (error) {
            console.error('Error verifying waste', error)
            setVerificationStatus('failure')
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (verificationStatus !== 'success' || !user) {
            toast.error('Please verify the waste before submitting or log in')
            return
        }

        setIsSubmitting(true)

        try {
            const report = await createReport(
                user.id,
                newReport.location,
                newReport.type,
                preview ?? '',
                verificationResult ? JSON.stringify(verificationResult) : undefined
            ) as any

            const formattedReport = {
                id: report.id,
                location: report.location,
                wasteType: report.wasteType,
                amount: report.amount,
                createdAt: report.createdAt.toISOString().split('T')[0]
            }

            setReports([formattedReport, ...reports])
            setNewReport({
                location: "",
                type: "",
                amount: ""
            })
            setFile(null)
            setPreview(null)
            setVerificationStatus('idle')
            setVerificationResult(null)

            toast.success(`Report submitted successfully! You've earned points for reporting waste `)

        } catch (error) {
            console.log("Error submitteing report", error)
            toast.error(`Failed to submit report. Please try again`)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const checkUser = async () => {
            const email = localStorage.getItem("userEmail")
            if (email) {
                let user = await getUserByEmail(email)
                setUser(user?.email ?? '')

                const recentReports = await getRecentReports() as any

                const formattedReports = recentReports.map((report: any) => ({
                    ...report,
                    createdAt: report.createdAt.toISOString().split('T')[0]
                }))

                setReports(formattedReports)
            } else {
                router.push('/')
            }
        }
        checkUser()
    }, [router])


    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">
                Report Waste
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mb-12">
                <div className="mb-8">
                    <label htmlFor="waste-image" className="block text-lg font-semibold text-gray-700 mb-2">
                        Upload Waste Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors duration-300">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="waste-image"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none 
                                    focus-within:ring-2 focus-within:ring-green-500"
                                >
                                    <span>Upload a file</span>
                                    <input id="waste-image" name="waste-image" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10 MB</p>
                        </div>
                    </div>
                </div>

                {preview && (
                    <div className="mt-4 mb-8">
                        <img src={preview} alt="Waste preview" className="max-w-full h-auto rounded-xl shadow-md" />
                    </div>
                )}

                <Button className="w-full mb-8 bg-blue-600 text-white text-lg rounded-xl transition-colors duration-300"
                    disabled={!file || verificationStatus === "verifying"} type="button" onClick={handleVerify}>
                    {
                        verificationStatus === 'verifying' ? (
                            <>
                                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white " />
                                Verifying .....
                            </>
                        ) : "Verify waste"
                    }
                </Button>

                {verificationStatus === 'success' && verificationResult && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
                        <div className="flex items-center">
                            <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-green-800">Verification Successful</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Waste Type: {verificationResult.wasteType}</p>
                                    <p>Quantity: {verificationResult.quantity}</p>
                                    <p>Confidence: {(verificationResult.confidence * 100).toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </form>
        </div>
    )

}
