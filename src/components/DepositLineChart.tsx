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
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
                data={data}
                margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="date" scale="band" />
                <YAxis />
                <Tooltip />
                <Legend />

                {/* Expense Stack */}
                {expenseCategories.map((cat) => (
                    <Bar
                        key={`exp-${cat}`}
                        dataKey={cat}
                        stackId="expense"
                        fill={getColor(cat + 'exp')}
                        name={cat}
                    />
                ))}
                {/* Total Expense Line */}
                <Line type="monotone" dataKey="expenseTotal" stroke="#b91c1c" strokeWidth={2} dot={false} name="Total Expense" />


                {/* Income Stack - Rendered as separate stack group or same? Usually separate for comparison */}
                {/* Using valid stackId to group them. 'expense' vs 'income' */}
                {incomeCategories.map((cat) => (
                    <Bar
                        key={`inc-${cat}`}
                        dataKey={cat}
                        stackId="income"
                        fill={getColor(cat + 'inc')}
                        name={cat}
                    />
                ))}
                {/* Total Income Line */}
                <Line type="monotone" dataKey="incomeTotal" stroke="#15803d" strokeWidth={2} dot={false} name="Total Income" />

                <Brush dataKey="date" height={30} stroke="#8884d8" />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default DepositLineChart;
