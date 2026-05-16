import React from 'react';

export const Layout = ({ children, ...props }: {children?: React.ReactNode, [key: string]: any}) => <div className="w-full min-h-screen">{children}</div>;