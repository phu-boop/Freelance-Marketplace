import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Static routes
    const routes = [
        '',
        '/login',
        '/signup',
        '/how-it-works',
        '/enterprise',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }));

    // In a real scenario, we would fetch dynamic IDs here
    // const jobs = await api.get('/jobs/public'); 
    // const jobRoutes = jobs.map(...)

    const categoryRoutes = ['development', 'design', 'marketing'].map((cat) => ({
        url: `${baseUrl}/hire/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...categoryRoutes];
}
