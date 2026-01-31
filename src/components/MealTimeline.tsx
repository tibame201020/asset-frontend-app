import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface MealTimelineProps {
    data: any[];
    mealTypes: string[];
}

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#82ca9d'];

const MealTimeline: React.FC<MealTimelineProps> = ({ data, mealTypes }) => {
    const { t } = useTranslation();

    const getColor = (index: number) => COLORS[index % COLORS.length];

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center opacity-30 italic">
                {t('deposit.table.noRecords')}
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-base-100/30 rounded p-2 border border-base-300 shadow-inner flex flex-col overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        scale="band"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '1.5rem',
                            border: 'none',
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            padding: '1rem'
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{
                            paddingBottom: '20px',
                            fontWeight: 'bold',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            opacity: 0.8
                        }}
                    />

                    {/* Stacked Bars for Meal Types */}
                    {mealTypes.map((type, index) => (
                        <Bar
                            key={type}
                            dataKey={type}
                            stackId="a"
                            fill={getColor(index)}
                            name={type}
                            barSize={8}
                            radius={[1, 1, 1, 1]}
                        />
                    ))}

                    {/* Total Line */}
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#ef9fbc"
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#ef9fbc', strokeWidth: 1 }}
                        activeDot={{ r: 6, strokeWidth: 1 }}
                        name={t('meal.dashboard.total')}
                    />

                    <Brush
                        dataKey="date"
                        height={24}
                        stroke="#ef9fbc"
                        fill="rgba(255, 255, 255, 0.5)"
                        travellerWidth={8}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MealTimeline;
