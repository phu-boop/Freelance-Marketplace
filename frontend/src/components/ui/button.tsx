'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, asChild = false, ...props }, ref) => {
        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20',
            secondary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20',
            outline: 'border border-slate-700 text-slate-300 hover:bg-slate-900 hover:text-white',
            ghost: 'text-slate-400 hover:text-white hover:bg-slate-900',
            glass: 'glass text-white hover:bg-white/10',
            destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20',
        };

        const sizes = {
            sm: 'px-4 py-2 text-xs',
            md: 'px-6 py-3 text-sm',
            lg: 'px-8 py-4 text-base',
            icon: 'h-10 w-10 p-2 flex items-center justify-center',
        };

        const buttonClasses = cn(
            'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
            variants[variant],
            sizes[size],
            className
        );

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                className: cn(buttonClasses, (children.props as any).className),
                ref,
                ...props
            });
        }

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={buttonClasses}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </span>
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
