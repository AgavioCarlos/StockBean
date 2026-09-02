import React, { useState, useEffect } from 'react';
import Header from './Header';
import SessionTimeout from '../SessionTimeout';
import DynamicSidebar from './DynamicSidebar';
import { useResponsive } from '../../hooks/useResponsive';

interface MainLayoutProps {
    children: React.ReactNode;
    rightPanel?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, rightPanel }) => {
    const { isMobile } = useResponsive();
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState === 'true';
    });

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const desktopMargin = !isMobile && isSidebarOpen ? (sidebarCollapsed ? 80 : 288) : 0;

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[25%] h-[25%] bg-blue-100/40 rounded-full blur-[100px]"></div>
            </div>

            <SessionTimeout />
            <Header
                isSidebarOpen={isSidebarOpen}
                sidebarCollapsed={sidebarCollapsed}
                onOpenSidebar={() => setIsSidebarOpen(true)}
            />

            <DynamicSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                collapsed={sidebarCollapsed}
                onCollapsedChange={setSidebarCollapsed}
            />
            <main
                className="flex-grow flex flex-col p-4 md:p-8 transition-all duration-300 ease-in-out relative z-10"
                style={{
                    marginLeft: desktopMargin
                }}
            >
                <div className="flex-grow w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 items-stretch">
                    <div className="flex-grow flex flex-col w-full min-w-0">
                        {children}
                    </div>
                    {rightPanel && (
                        <aside className="w-full lg:w-[320px] xl:w-[380px] shrink-0 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto hidden lg:flex flex-col gap-6">
                            {rightPanel}
                        </aside>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
