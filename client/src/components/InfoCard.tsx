interface InfoCardProps {
  label: string;
  value: string;
}

const InfoCard = ({ label, value }: InfoCardProps) => (
  <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
    <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
  </div>
);

export default InfoCard;
