import React from 'react';
import { PLANS } from '../data/plans';
import { useAuth } from '../context/AuthContext';
import { Plan, PlanTier } from '../types';

const PlanCard: React.FC<{ plan: Plan; isCurrentPlan: boolean; onSwitchPlan: (plan: PlanTier) => void, currentPlanPrice: number }> = ({ plan, isCurrentPlan, onSwitchPlan, currentPlanPrice }) => {
    
    let buttonText = 'Switch';
    let buttonAction: (() => void) | undefined = () => onSwitchPlan(plan.name);
    
    if (isCurrentPlan) {
        buttonText = 'Current Plan';
        buttonAction = undefined;
    } else if (plan.price > currentPlanPrice) {
        buttonText = 'Upgrade';
    } else {
        buttonText = 'Downgrade';
    }

    return (
        <div className={`relative flex flex-col p-6 bg-[#111832] rounded-lg border ${isCurrentPlan ? 'border-blue-500' : 'border-gray-700'}`}>
            {isCurrentPlan && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                </div>
            )}
            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <p className="mt-2 text-gray-400">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                /month
            </p>
            <ul className="mt-6 space-y-3 text-gray-300 flex-grow">
                <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {plan.imagesIncluded} images
                </li>
                 <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {plan.videoSecondsIncluded} video seconds
                </li>
                 <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Priority support
                </li>
            </ul>
            <button
                onClick={buttonAction}
                disabled={isCurrentPlan}
                className={`w-full mt-8 px-4 py-2 rounded-md font-semibold transition-colors ${
                    isCurrentPlan
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const Usage: React.FC = () => {
    const { user, switchPlan } = useAuth();
    // User is guaranteed to exist due to Layout gate
    const plans = Object.values(PLANS);
    const currentPlanPrice = PLANS[user!.plan].price;

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Pricing Plans</h2>
            <p className="text-gray-400 mb-10 text-center">Choose the plan that's right for your creative needs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map(plan => (
                    <PlanCard
                        key={plan.name}
                        plan={plan}
                        isCurrentPlan={user!.plan === plan.name}
                        onSwitchPlan={switchPlan}
                        currentPlanPrice={currentPlanPrice}
                    />
                ))}
            </div>
        </div>
    );
};

export default Usage;