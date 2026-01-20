import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, GraduationCap } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    duration: string;
}

const AcademyDashboard = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch - using real API endpoint structure
        fetch('http://localhost:3004/academy/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error("Failed to load courses", err))
            .finally(() => setLoading(false));
    }, []);

    const handleEnroll = async (courseId: string) => {
        console.log(`Enrolling in ${courseId}`);
        // Call API to enroll
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academy & Certifications</h1>
                    <p className="text-muted-foreground">Upskill and earn verified badges.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map(course => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant={course.difficulty === 'BEGINNER' ? 'secondary' : 'default'}>
                                    {course.difficulty}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" /> {course.duration}
                                </span>
                            </div>
                            <CardTitle className="mt-2">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                                <GraduationCap className="mr-2 h-4 w-4" /> Enroll Now
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AcademyDashboard;
