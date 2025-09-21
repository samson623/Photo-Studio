import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CubeIcon } from './icons/CubeIcon';
import { EmailIcon } from './icons/EmailIcon';
import { LockIcon } from './icons/LockIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle } = useAuth();

    const handleAuthAction = async (action: () => Promise<void>) => {
        setError(null);
        setLoading(true);
        try {
            await action();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            handleAuthAction(() => signUp(name, email, password));
        } else {
            handleAuthAction(() => signIn(email, password));
        }
    };

    const handleGoogleSignIn = () => {
        handleAuthAction(signInWithGoogle);
    };

    const toggleFormMode = () => {
        setIsSignUp(!isSignUp);
        setError(null);
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="min-h-screen bg-[#0A1024] flex items-center justify-center p-4 bg-gradient-to-br from-[#0A1024] via-[#111832] to-[#0A1024]">
            <div className="w-full max-w-md bg-[#111827] bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
                <div className="text-center mb-8">
                    <CubeIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-white">Photo Studio</h1>
                    <p className="text-gray-400 mt-2">{isSignUp ? 'Create an account to get started' : 'Welcome back! Sign in to continue'}</p>
                    <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Full Name</label>
                            <UserCircleIcon className="w-5 h-5 text-gray-400 absolute left-4 top-11" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Email Address</label>
                        <EmailIcon className="w-5 h-5 text-gray-400 absolute left-4 top-11" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                         <label className="text-sm font-medium text-gray-400 mb-2 block">Password</label>
                         <LockIcon className="w-5 h-5 text-gray-400 absolute left-4 top-11" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <ArrowRightIcon className="w-5 h-5 mr-2" />
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                >
                    <GoogleIcon className="w-5 h-5 mr-3" />
                    Continue with Google
                </button>

                <div className="text-center mt-8">
                    <p className="text-gray-400">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={toggleFormMode} className="text-indigo-400 hover:text-indigo-300 font-semibold ml-2">
                             {isSignUp ? 'Sign in here' : 'Sign up here'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;