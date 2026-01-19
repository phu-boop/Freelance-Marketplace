'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Award, BookOpen, Clock, CheckCircle2, Loader2, Rocket, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    badgeName: string;
    _count: { lessons: number };
}

interface Certification {
    id: string;
    issuedAt: string;
    course: Course;
}

export default function AcademyDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [coursesRes, certsRes] = await Promise.all([
                api.get('/community/api/academy/courses'),
                api.get('/community/api/academy/my-certifications'),
            ]);
            setCourses(coursesRes.data);
            setCertifications(certsRes.data);
        } catch (error) {
            console.error("Failed to fetch academy data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const isCertified = (courseId: string) => certifications.some(c => c.course.id === courseId);

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-500 font-bold tracking-tighter uppercase text-sm">
                        <GraduationCap className="w-5 h-5" />
                        Marketplace Academy
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Level Up Your Career</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">Master the art of freelance success with expert-led courses and earn industry-recognized badges.</p>
                </div>
                <div className="flex items-center gap-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Certificates</p>
                        <p className="text-3xl font-black text-white">{certifications.length}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-800" />
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Badges</p>
                        <p className="text-3xl font-black text-blue-500">{certifications.filter(c => c.course.badgeName).length}</p>
                    </div>
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                    Available Courses
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col group hover:border-blue-500/50 transition-all duration-300">
                            <div className="aspect-video bg-slate-950 relative overflow-hidden">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                                        <Rocket className="w-12 h-12 text-slate-800 group-hover:text-blue-500/20 transition-colors" />
                                    </div>
                                )}
                                {isCertified(course.id) && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-1 rounded">
                                        <Clock className="w-3 h-3" />
                                        1.5 Hours
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">
                                        {course._count.lessons} Lessons
                                    </span>
                                </div>
                                <CardTitle className="text-lg font-bold text-white mb-2 leading-tight">{course.title}</CardTitle>
                                <CardDescription className="text-slate-500 text-xs leading-relaxed line-clamp-2">{course.description}</CardDescription>
                            </CardHeader>
                            <CardFooter className="pt-0 pb-6 px-6">
                                <Button className={`w-full font-bold transition-all ${isCertified(course.id) ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                                    {isCertified(course.id) ? 'Review Course' : 'Start Learning'}
                                    {!isCertified(course.id) && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {certifications.length > 0 && (
                <section className="space-y-6 pt-10 border-t border-slate-800/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Award className="w-6 h-6 text-yellow-500" />
                        My Certificates
                    </h2>
                    <div className="grid gap-4">
                        {certifications.map(cert => (
                            <div key={cert.id} className="flex items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                        <Award className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{cert.course.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">Earned on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="border-slate-800 text-slate-400 hover:bg-slate-800 font-bold text-xs h-9">Download PDF</Button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
