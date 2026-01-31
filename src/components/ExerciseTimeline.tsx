import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface ExerciseTimelineProps {
    data: any[];
    exerciseTypes: string[];
}

const ExerciseTimeline: React.FC<ExerciseTimelineProps> = ({ data, exerciseTypes }) => {
    const { t } = useTranslation();
    const getColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    return (
        <div className="h-full w-full bg-base-100/30 rounded p-2 border border-base-300 shadow-inner flex flex-col overflow-hidden">
            <div className="flex-grow min-h-0 w-full relative overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{
                            top: 10, right: 30, bottom: 0, left: 10,
                        }}
                    >
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

                        {/* Exercise Type Stack */}
                        {exerciseTypes.map((type) => (
                            <Bar
                                key={`type-${type}`}
                                dataKey={type}
                                stackId="exercise"
                                fill={getColor(type)}
                                name={type}
                                barSize={8}
                                radius={[1, 1, 1, 1]}
                            />
                        ))}

                        {/* Total Calories Line */}
                        <Line
                            type="monotone"
                            dataKey="calorieTotal"
                            stroke="#65c3c8"
                            strokeWidth={2}
                            dot={{ r: 2, fill: '#65c3c8', strokeWidth: 1 }}
                            activeDot={{ r: 6, strokeWidth: 1 }}
                            name={t('exercise.stats.totalCalories')}
                        />

                        <Brush
                            dataKey="date"
                            height={24}
                            stroke="#65c3c8"
                            fill="rgba(255, 255, 255, 0.5)"
                            travellerWidth={8}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExerciseTimeline;
