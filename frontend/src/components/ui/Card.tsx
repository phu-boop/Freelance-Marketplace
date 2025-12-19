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
                'rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition-colors',
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
