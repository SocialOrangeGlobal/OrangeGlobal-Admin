import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface JobStatusOverviewProps {
  activeJobs: number;
  totalJobs: number;
}

export default function JobStatusOverview({ activeJobs, totalJobs }: JobStatusOverviewProps) {
  // Calculate percentage safely
  const percentage = totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0;
  
  const series = [percentage];
  const options: ApexOptions = {
    colors: ["#10B981"], // Emerald-500
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#10B981"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Active Jobs"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Job Status Overview
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Active vs Draft Jobs Distribution
            </p>
          </div>
        </div>
        <div className="relative mt-6">
          <div className="max-h-[330px]">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
            {activeJobs} Active
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          There are {activeJobs} published jobs currently open to talents out of {totalJobs} total jobs.
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Jobs
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {totalJobs}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Active
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-emerald-600 dark:text-emerald-500 sm:text-lg">
            {activeJobs}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Draft/Closed
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {totalJobs - activeJobs}
          </p>
        </div>
      </div>
    </div>
  );
}
