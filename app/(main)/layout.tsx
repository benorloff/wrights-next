import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

const DashboardLayout = ({ 
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="h-screen w-full pl-[56px]">
            <Sidebar />
            <div className="flex flex-col">
                <Topbar />
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;