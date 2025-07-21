import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Shield, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold">OCA WebSchool</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Path to High School Success
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Earn your high school diploma with our AI-powered personalized learning platform. 
            Designed for students, parents, and educators.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <GraduationCap className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle>For Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Personalized learning paths, interactive lessons, and progress tracking 
                to help you earn your diploma at your own pace.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle>For Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your child&apos;s progress, view grades, and stay informed about 
                their educational journey.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle>For Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive school management tools, student oversight, and 
                course administration capabilities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students who have successfully earned their high school diploma with OCA WebSchool.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Create Your Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
