
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PLANS } from '../data/plans';

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[#111832] p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
        {children}
    </div>
);

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{value} / {max}</span>
                <span>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    // User is guaranteed to be non-null here because of the Layout auth gate
    const userPlan = PLANS[user!.plan];

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Current Plan">
                    <p className="text-2xl font-semibold text-white">{userPlan.name}</p>
                    <p className="text-gray-400">${userPlan.price}/mo</p>
                </StatCard>
                <StatCard title="Image Usage">
                    <ProgressBar value={user!.imagesUsed} max={userPlan.imagesIncluded} />
                </StatCard>
                <StatCard title="Video Usage (seconds)">
                    <ProgressBar value={user!.videoSecondsUsed} max={userPlan.videoSecondsIncluded} />
                </StatCard>
            </div>
        </div>
    );
};

export default Dashboard;