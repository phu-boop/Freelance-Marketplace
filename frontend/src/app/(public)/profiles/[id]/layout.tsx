import { Metadata } from 'next';
import axios from 'axios';

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = params.id;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    try {
        const response = await axios.get(`${baseURL}/users/${id}`);
        const user = response.data;
        const name = `${user.firstName} ${user.lastName}`;
        const title = `${name} | ${user.title || 'Freelancer'} | FreelanceHub`;
        const description = user.overview?.slice(0, 160) || `Check out ${name}'s expertise and portfolio on FreelanceHub.`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: user.avatarUrl ? [{ url: user.avatarUrl }] : [],
                type: 'profile',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: user.avatarUrl ? [user.avatarUrl] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Freelancer Profile | FreelanceHub',
            description: 'View freelancer expertise and work history.',
        };
    }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
