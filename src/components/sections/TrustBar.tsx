import { ShieldCheck, Zap, Users, Trophy } from "lucide-react";

const TRUST_METRICS = [
  { icon: ShieldCheck, title: "Fully Insured", subtitle: "2M Liability Coverage" },
  { icon: Zap, title: "Industry Standard", subtitle: "QSC, Shure & Pioneer" },
  { icon: Users, title: "500+ Events", subtitle: "Successfully Produced" },
  { icon: Trophy, title: "5-Star Rated", subtitle: "On Google & Yelp" }
];

export function TrustBar() {
  return (
    <div className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 divide-x divide-gray-100 dark:divide-slate-800">
          {TRUST_METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center px-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-3 text-blue-600 dark:text-blue-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{metric.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{metric.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
