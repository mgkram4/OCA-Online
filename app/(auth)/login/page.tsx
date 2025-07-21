'use client'

import { SignIn } from '@clerk/nextjs'
import { BookOpen, GraduationCap } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">OCA WebSchool</h1>
          </div>
          <p className="text-gray-600">Your path to high school success</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'shadow-none',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'bg-white border border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                footerActionLink: 'text-blue-600 hover:text-blue-700'
              }
            }}
            redirectUrl="/dashboard"
            signUpUrl="/register"
          />
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">AI-powered personalized learning</span>
          </div>
        </div>
      </div>
    </div>
  )
} 