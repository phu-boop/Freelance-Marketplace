
import { Metadata } from 'next';
import ProfileView from './ProfileView';

async function getFreelancer(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    try {
        const res = await fetch(`${apiUrl}/users/${id}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Failed to fetch freelancer", e);
        return null;
    }
}

async function getReviews(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    try {
        const res = await fetch(`${apiUrl}/reviews/reviewee/${id}`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        return [];
    }
}

type Props = {
    params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const user = await getFreelancer(params.id);
    if (!user) return { title: 'Freelancer Not Found' };

    return {
        title: `${user.firstName} ${user.lastName} | Freelance Marketplace`,
        description: user.overview ? user.overview.substring(0, 160) : `Check out ${user.firstName} ${user.lastName}'s profile.`,
        openGraph: {
            title: `${user.firstName} ${user.lastName} - ${user.title || 'Freelancer'}`,
            description: user.overview ? user.overview.substring(0, 200) : '',
        }
    };
}

export default async function FreelancerProfilePage({ params }: Props) {
    const [user, reviews] = await Promise.all([
        getFreelancer(params.id),
        getReviews(params.id)
    ]);

    if (!user) {
        return <div className="p-12 text-center text-slate-400">User not found</div>;
    }

    return <ProfileView user={user} reviews={reviews} />;
}
