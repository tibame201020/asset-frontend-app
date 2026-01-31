import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface MealChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#82ca9d'];

const MealChart: React.FC<MealChartProps> = ({ data }) => {
    const { t } = useTranslation();
    const [isLargeScreen, setIsLargeScreen] = React.useState(window.innerWidth >= 1024);

    React.useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 py-20">
                <AlertCircle size={48} strokeWidth={1} />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">{t('deposit.table.noRecords')}</span>
            </div>
        );
    }

    const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="h-full w-full bg-base-100/30 rounded p-3 lg:p-4 border border-base-300 shadow-inner flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch overflow-hidden">
            {/* Visual Pane */}
            <div className="flex-grow min-h-[300px] lg:h-full lg:w-3/5 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={isLargeScreen}
                            label={isLargeScreen ? ({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(1)}%)` : false}
                            innerRadius={isLargeScreen ? "70%" : "60%"}
                            outerRadius={isLargeScreen ? "85%" : "80%"}
                            paddingAngle={8}
                            cornerRadius={4}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number | undefined) => `${(value || 0).toLocaleString()} kcal`}
                            contentStyle={{
                                borderRadius: '2rem',
                                border: 'none',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(12px)',
                                padding: '1.25rem'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Data Pane: Rich Legend */}
            <div className="w-full lg:w-2/5 flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden border-t lg:border-t-0 lg:border-l border-base-content/5 pt-4 lg:pt-0 lg:pl-6">
                <div className="flex flex-col gap-1 border-b border-base-300 pb-3 mb-4 shrink-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-30">{t('exercise.tabs.analysis')}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold opacity-40">{t('meal.dashboard.intake')}:</span>
                        <span className="text-2xl font-mono font-black text-primary">{totalValue.toLocaleString()} <span className="text-sm opacity-50">kcal</span></span>
                    </div>
                </div>

                <div className="flex-grow overflow-visible lg:overflow-y-auto scroll-modern pr-4 py-2 flex flex-col gap-6">
                    {[...data].sort((a, b) => b.value - a.value).map((item, index) => {
                        const percentage = ((item.value / totalValue) * 100).toFixed(1);
                        const color = COLORS[data.indexOf(item) % COLORS.length];

                        return (
                            <div key={index} className="flex flex-col gap-2 group hover:translate-x-1 transition-transform cursor-default">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded shadow-sm" style={{ backgroundColor: color }}></div>
                                        <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono font-bold opacity-50 block leading-none mb-1">{percentage}%</span>
                                        <span className="text-sm font-mono font-black border-b-2" style={{ borderColor: `${color}40` }}>{item.value.toLocaleString()} kcal</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-base-content/5 rounded overflow-hidden">
                                    <div
                                        className="h-full rounded transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: color,
                                            boxShadow: `0 0 10px ${color}40`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MealChart;
