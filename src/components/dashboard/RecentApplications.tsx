import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface RecentApplicationsProps {
  applications: Array<{
    id: string;
    candidateName: string;
    candidateAvatar: string | null;
    jobTitle: string;
    status: string;
    appliedAt: string;
    atsScore: number | null;
  }>;
}

export default function RecentApplications({ applications }: RecentApplicationsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
      case "UNDER_REVIEW":
        return "info";
      case "SHORTLISTED":
      case "INTERVIEW_SCHEDULED":
      case "INTERVIEW_COMPLETED":
        return "warning";
      case "OFFER_SENT":
      case "OFFER_ACCEPTED":
        return "success";
      case "REJECTED":
      case "WITHDRAWN":
      case "OFFER_REJECTED":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Applications
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Candidate
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Job Position
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Applied Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                ATS Score
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        {app.candidateAvatar ? (
                          <img
                            src={app.candidateAvatar}
                            alt={app.candidateName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-400">{app.candidateName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {app.candidateName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 font-medium text-theme-sm dark:text-gray-200">
                    {app.jobTitle}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatusColor(app.status) as any}>
                      {getStatusLabel(app.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    {app.atsScore !== null ? (
                      <span className={`font-semibold ${app.atsScore >= 70 ? 'text-emerald-500' : app.atsScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {app.atsScore}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No recent applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
