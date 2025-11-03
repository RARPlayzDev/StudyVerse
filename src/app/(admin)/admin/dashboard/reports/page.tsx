import PageTitle from "@/components/common/page-title";
import { ReportDisplay } from "@/components/admin/report-display";

export default function AdminReportsPage() {
    return (
        <div>
            <PageTitle title="AI-Generated Reports" subtitle="Get automated insights into platform activity and performance." />
            <ReportDisplay />
        </div>
    );
}
