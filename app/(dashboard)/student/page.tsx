'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    GraduationCap,
    Target,
    TrendingUp
} from 'lucide-react'

export default function StudentDashboard() {
  // Mock student data
  const student = {
    name: 'Alex Johnson',
    gradeLevel: 11,
    gpa: 3.7,
    totalCredits: 18,
    graduationYear: 2025,
    currentCourses: [
      {
        id: '1',
        title: 'Advanced Mathematics',
        subject: 'Math',
        progress: 75,
        nextAssignment: 'Calculus Quiz',
        dueDate: '2024-01-25',
        teacher: 'Dr. Smith'
      },
      {
        id: '2',
        title: 'World History',
        subject: 'History',
        progress: 45,
        nextAssignment: 'Essay on Ancient Rome',
        dueDate: '2024-01-28',
        teacher: 'Ms. Davis'
      },
      {
        id: '3',
        title: 'Physics',
        subject: 'Science',
        progress: 60,
        nextAssignment: 'Lab Report',
        dueDate: '2024-01-26',
        teacher: 'Mr. Wilson'
      }
    ],
    upcomingAssignments: [
      {
        id: '1',
        title: 'Calculus Quiz',
        course: 'Advanced Mathematics',
        dueDate: '2024-01-25',
        type: 'Quiz'
      },
      {
        id: '2',
        title: 'Lab Report',
        course: 'Physics',
        dueDate: '2024-01-26',
        type: 'Assignment'
      },
      {
        id: '3',
        title: 'Essay on Ancient Rome',
        course: 'World History',
        dueDate: '2024-01-28',
        type: 'Essay'
      }
    ]
  }

  const graduationProgress = (student.totalCredits / 22) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student.name}!</h1>
          <p className="text-gray-600">Track your progress toward graduation</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Grade {student.gradeLevel}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.gpa}</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.totalCredits}/22</div>
            <p className="text-xs text-muted-foreground">
              {graduationProgress.toFixed(1)}% to graduation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.currentCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.upcomingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Assignments due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graduation Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Graduation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress to Graduation</span>
              <span className="text-sm text-gray-600">{graduationProgress.toFixed(1)}%</span>
            </div>
            <Progress value={graduationProgress} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Credits Earned:</span> {student.totalCredits}
              </div>
              <div>
                <span className="font-medium">Credits Remaining:</span> {22 - student.totalCredits}
              </div>
              <div>
                <span className="font-medium">Graduation Year:</span> {student.graduationYear}
              </div>
              <div>
                <span className="font-medium">Current GPA:</span> {student.gpa}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Courses */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Current Courses</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {student.currentCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600">{course.subject} • {course.teacher}</p>
                  </div>
                  <Badge variant="outline">{course.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Course Progress</span>
                    <span className="text-sm text-gray-600">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Next Assignment</p>
                    <p className="text-xs text-gray-600">{course.nextAssignment}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(course.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {student.upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-gray-600">{assignment.course} • {assignment.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Completed Advanced Mathematics Module</p>
                <p className="text-xs text-gray-600">Earned 3 credits in Calculus</p>
              </div>
              <span className="text-xs text-gray-500">2 days ago</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <Award className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Perfect Score on Physics Quiz</p>
                <p className="text-xs text-gray-600">100% on Mechanics Quiz</p>
              </div>
              <span className="text-xs text-gray-500">1 week ago</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">GPA Improvement</p>
                <p className="text-xs text-gray-600">GPA increased from 3.5 to 3.7</p>
              </div>
              <span className="text-xs text-gray-500">2 weeks ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 