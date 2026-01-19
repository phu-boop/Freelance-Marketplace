"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Briefcase, Gavel } from "lucide-react"
import JurisdictionNotice from "./JurisdictionNotice"

interface HireModalProps {
    freelancerId: string
    freelancerName: string
    countryCode?: string
}

export function HireModal({ freelancerId, freelancerName, countryCode }: HireModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [jobs, setJobs] = useState<any[]>([])
    const [selectedJobId, setSelectedJobId] = useState<string>("")
    const [message, setMessage] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (open) {
            fetchJobs()
        }
    }, [open])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const res = await api.get('/jobs/my-jobs?status=OPEN')
            setJobs(res.data)
        } catch (error) {
            console.error("Failed to fetch jobs", error)
            toast.error("Failed to load your jobs")
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async () => {
        if (!selectedJobId) {
            toast.error("Please select a job")
            return
        }

        try {
            setLoading(true)
            await api.post('/invitations', {
                freelancerId,
                jobId: selectedJobId,
                message
            })
            toast.success("Invitation sent successfully")
            setOpen(false)
            setMessage("")
            setSelectedJobId("")
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to send invitation"
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="px-6 py-2.5 h-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                    <Briefcase className="w-4 h-4" /> Hire Freelancer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Hire {freelancerName}</DialogTitle>
                    <DialogDescription>
                        Invite {freelancerName} to one of your open jobs.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="job-select">Select Job</Label>
                        {loading && jobs.length === 0 ? (
                            <div className="text-sm text-slate-500">Loading jobs...</div>
                        ) : jobs.length > 0 ? (
                            <div className="relative">
                                <select
                                    id="job-select"
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white appearance-none"
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                >
                                    <option value="" disabled>Select a job...</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom chevron if desired, or rely on browser default (removed appearance-none above if needed but basic styling usually wants it) */}
                            </div>
                        ) : (
                            <div className="text-sm text-yellow-500 bg-yellow-900/20 p-3 rounded-md border border-yellow-900/50">
                                You don't have any open jobs.
                                <Button variant="ghost" className="text-yellow-500 pl-1 h-auto p-0 hover:underline" onClick={() => router.push('/client/jobs/new')}>
                                    Create one now
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Invitation Message</Label>
                        <textarea
                            id="message"
                            className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            placeholder={`Hi ${freelancerName}, I'd like to invite you to discuss my project...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    {countryCode && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Gavel className="w-3 h-3 text-slate-400" />
                                Jurisdiction & Compliance
                            </Label>
                            <JurisdictionNotice countryCode={countryCode} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={loading || !selectedJobId}>
                        {loading ? "Sending..." : "Send Invitation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
