import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ApplicationTrendsChartProps {
  statusDistribution: Record<string, number>;
}

export default function ApplicationTrendsChart({ statusDistribution }: ApplicationTrendsChartProps) {
  
  // Format the statuses for nice display
  const formatLabel = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const categories = Object.keys(statusDistribution).map(formatLabel);
  const data = Object.values(statusDistribution);

  const options: ApexOptions = {
    colors: ["#fb6514"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 250,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ["No Data"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        }
      }
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#64748B",
        }
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} applications`,
      },
    },
  };

  const series = [
    {
      name: "Applications",
      data: data.length > 0 ? data : [0],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-2 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Application Pipeline
          </h3>
          <p className="text-sm text-gray-500 mt-1">Applications by Status</p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[500px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={250} />
        </div>
      </div>
    </div>
  );
}
