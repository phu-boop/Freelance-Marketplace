'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    CheckCircle2,
    Award,
    Play,
    Clock,
    ChevronRight,
    Search,
    Loader2,
    Sparkles,
    Star
} from 'lucide-react';
import api from '@/lib/api';
import { useKeycloak } from '@/components/KeycloakProvider';

interface Lesson {
    id: string;
    title: string;
    order: number;
    duration: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    badgeName: string;
    lessons: Lesson[];
    _count: { lessons: number };
}

interface Certification {
    id: string;
    courseId: string;
    issuedAt: string;
}

export default function AcademyPage() {
    const { userId } = useKeycloak();
    const [courses, setCourses] = useState<Course[]>([]);
    const [myCertifications, setMyCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchAcademyData();
    }, []);

    const fetchAcademyData = async () => {
        setLoading(true);
        try {
            const [coursesRes, certsRes] = await Promise.all([
                api.get('/community/academy/courses'),
                api.get('/community/academy/certifications/my')
            ]);
            setCourses(coursesRes.data);
            setMyCertifications(certsRes.data);
        } catch (error) {
            console.error('Failed to fetch academy data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteCourse = async (courseId: string) => {
        setCompleting(true);
        try {
            await api.post(`/community/academy/courses/${courseId}/complete`);
            alert('Congratulations! You have earned a new badge.');
            fetchAcademyData();
        } catch (error) {
            console.error('Failed to complete course', error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Preparing Your Learning Path...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Hero Header */}
                <header className="relative p-12 rounded-[3rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/20 overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" />
                            Premium Academy
                        </div>
                        <h1 className="text-5xl font-black text-white leading-none uppercase tracking-tighter">
                            Master Your <span className="text-indigo-400">Professional</span> Path
                        </h1>
                        <p className="text-slate-400 font-medium text-lg">
                            Earn certified badges and boost your visibility to high-end clients through our expert-led modules.
                        </p>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full" />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Courses Grid */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                                Available Modules
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {courses.map(course => {
                                const isCertified = myCertifications.some(c => c.courseId === course.id);
                                return (
                                    <div
                                        key={course.id}
                                        className="group relative bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 hover:border-indigo-500/50 transition-all cursor-pointer"
                                        onClick={() => setSelectedCourse(course)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="p-4 bg-slate-800 rounded-3xl group-hover:scale-110 transition-transform">
                                                <Award className={`w-8 h-8 ${isCertified ? 'text-amber-400' : 'text-slate-500'}`} />
                                            </div>
                                            {isCertified && (
                                                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Certified
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-white leading-tight">{course.title}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 font-medium">{course.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                                                    <Play className="w-3 h-3" />
                                                    {course._count.lessons} Lessons
                                                </span>
                                            </div>
                                            <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-black transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Certifications Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] space-y-6 shadow-xl sticky top-24">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight border-b border-slate-800 pb-4">
                                Your Badges
                            </h2>
                            <div className="space-y-4">
                                {myCertifications.map(cert => {
                                    const course = courses.find(c => c.id === cert.courseId);
                                    return (
                                        <div key={cert.id} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                                <Star className="w-5 h-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{course?.badgeName || 'Certified Member'}</p>
                                                <p className="text-[10px] font-medium text-slate-500">Earned on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {myCertifications.length === 0 && (
                                    <div className="text-center py-12 space-y-3">
                                        <Award className="w-12 h-12 text-slate-800 mx-auto" />
                                        <p className="text-sm text-slate-600 font-bold uppercase tracking-widest">No certifications yet.</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl transition-all uppercase tracking-widest text-xs">
                                View Full Portfolio
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Details Modal */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                            {/* Course Poster */}
                            <div className="bg-indigo-600 p-12 flex flex-col justify-between relative overflow-hidden">
                                <Award className="w-20 h-20 text-white/20" />
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-4xl font-black text-white leading-tight uppercase tracking-tighter">{selectedCourse.title}</h2>
                                    <p className="text-indigo-100 font-medium">{selectedCourse.description}</p>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Lesson List */}
                            <div className="p-12 space-y-6 flex flex-col h-full bg-slate-900">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Curriculum</h3>
                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar">
                                    {selectedCourse.lessons.map(lesson => (
                                        <div key={lesson.id} className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center gap-4">
                                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-500 rounded-full text-black font-black text-xs">
                                                {lesson.order}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white">{lesson.title}</p>
                                                <p className="text-[10px] text-slate-500">{lesson.duration} mins</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-6 mt-auto border-t border-slate-800">
                                    <button
                                        onClick={() => setSelectedCourse(null)}
                                        className="flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Close
                                    </button>
                                    {!myCertifications.some(c => c.courseId === selectedCourse.id) && (
                                        <button
                                            onClick={() => handleCompleteCourse(selectedCourse.id)}
                                            disabled={completing}
                                            className="flex-1 py-4 bg-amber-500 text-black font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                        >
                                            {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                            Complete & Certify
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
