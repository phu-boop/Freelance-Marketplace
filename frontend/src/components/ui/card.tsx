'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
    hover?: boolean;
    glass?: boolean;
}

export const Card = ({ className, children, hover = true, glass = true, ...props }: CardProps) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={cn(
                'rounded-3xl border border-slate-800 bg-slate-900/50 transition-colors',
                glass && 'glass-card',
                hover && 'hover:border-blue-500/30',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-slate-400", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6 pt-0", className)} {...props} />
)

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
)
