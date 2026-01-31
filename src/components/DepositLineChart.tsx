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
// import { useTheme } from '../contexts/ThemeContext';

interface DepositLineChartProps {
    data: any[];
    incomeCategories: string[];
    expenseCategories: string[];
}

const DepositLineChart: React.FC<DepositLineChartProps> = ({ data, incomeCategories, expenseCategories }) => {
    // Colors for categories (simple rotation or hash)
    const getColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    return (
        <div className="h-full w-full bg-base-100/30 rounded-2xl p-2 border border-base-300 shadow-inner flex flex-col overflow-hidden">
            <div className="flex-grow min-h-0 w-full relative overflow-hidden">
                <div className="w-full h-full">
                    <div className="w-full h-full">
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

                                {/* Expense Stack */}
                                {expenseCategories.map((cat) => (
                                    <Bar
                                        key={`exp-${cat}`}
                                        dataKey={cat}
                                        stackId="expense"
                                        fill={getColor(cat + 'exp')}
                                        name={cat}
                                        barSize={8}
                                        radius={[1, 1, 1, 1]}
                                    />
                                ))}
                                {/* Total Expense Line */}
                                <Line
                                    type="monotone"
                                    dataKey="expenseTotal"
                                    stroke="#ef4444"
                                    strokeWidth={1.5}
                                    dot={{ r: 1.5, fill: '#ef4444', strokeWidth: 1 }}
                                    activeDot={{ r: 5, strokeWidth: 1 }}
                                    name="Total Expense"
                                />


                                {/* Income Stack */}
                                {incomeCategories.map((cat) => (
                                    <Bar
                                        key={`inc-${cat}`}
                                        dataKey={cat}
                                        stackId="income"
                                        fill={getColor(cat + 'inc')}
                                        name={cat}
                                        barSize={8}
                                        radius={[1, 1, 1, 1]}
                                    />
                                ))}
                                {/* Total Income Line */}
                                <Line
                                    type="monotone"
                                    dataKey="incomeTotal"
                                    stroke="#22c55e"
                                    strokeWidth={1.5}
                                    dot={{ r: 1.5, fill: '#22c55e', strokeWidth: 1 }}
                                    activeDot={{ r: 5, strokeWidth: 1 }}
                                    name="Total Income"
                                />

                                <Brush
                                    dataKey="date"
                                    height={24}
                                    stroke="#8884d8"
                                    fill="rgba(255, 255, 255, 0.5)"
                                    travellerWidth={8}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositLineChart;
