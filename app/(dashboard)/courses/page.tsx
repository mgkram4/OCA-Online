'use client'

import { CourseCard } from '@/components/courses/CourseCard'
import { CourseEnrollmentModal } from '@/components/courses/CourseEnrollmentModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Clock, Filter, GraduationCap, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  credits: number
  price: number
  isFree: boolean
  requiresProctoring: boolean
  proctoringType: string | null
  totalHours: number | null
  difficulty: string | null
  modules: number
  enrollments: number
  isEnrolled: boolean
  totalLessons: number
  gradeLevel: number
  teachers: Array<{
    name: string
    role: string
  }>
}

const subjects = [
  'All Subjects',
  'Mathematics',
  'Science',
  'English',
  'History',
  'Social Studies',
  'Physical Education',
  'Electives'
]

const difficulties = [
  'All Levels',
  'beginner',
  'intermediate',
  'advanced'
]

const priceRanges = [
  'All Prices',
  '0-100',
  '100-250',
  '250-500',
  '500+'
]

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices')
  const [selectedGrade, setSelectedGrade] = useState('9')
  const [showProctoredOnly, setShowProctoredOnly] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [selectedGrade])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, selectedSubject, selectedDifficulty, selectedPriceRange, showProctoredOnly])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/courses?grade=${selectedGrade}`)
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        setCourses(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch courses:', response.statusText)
        setCourses([])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    // Ensure courses is an array
    if (!Array.isArray(courses)) {
      setFilteredCourses([])
      return
    }

    let filtered = [...courses]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Subject filter
    if (selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(course => course.subject === selectedSubject)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All Levels') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty)
    }

    // Price range filter
    if (selectedPriceRange !== 'All Prices') {
      const [min, max] = selectedPriceRange.split('-').map(p => parseFloat(p))
      filtered = filtered.filter(course => {
        if (course.isFree) return min === 0
        return course.price >= min && (max ? course.price <= max : true)
      })
    }

    // Proctoring filter
    if (showProctoredOnly) {
      filtered = filtered.filter(course => course.requiresProctoring)
    }

    setFilteredCourses(filtered)
  }

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course)
    setIsEnrollmentModalOpen(true)
  }

  const handleEnrollmentSuccess = () => {
    fetchCourses() // Refresh courses to update enrollment status
  }

  const stats = {
    totalCourses: Array.isArray(courses) ? courses.length : 0,
    enrolledCourses: Array.isArray(courses) ? courses.filter(c => c.isEnrolled).length : 0,
    freeCourses: Array.isArray(courses) ? courses.filter(c => c.isFree).length : 0,
    proctoredCourses: Array.isArray(courses) ? courses.filter(c => c.requiresProctoring).length : 0
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">
            Explore our comprehensive selection of high school courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {stats.totalCourses} Courses Available
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Courses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proctored</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proctoredCourses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Grade Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade Level</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === 'All Levels' ? 'All Levels' : 
                       difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range} value={range}>
                      {range === 'All Prices' ? 'All Prices' : `$${range}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proctoring Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Proctoring</label>
              <Button
                variant={showProctoredOnly ? "default" : "outline"}
                onClick={() => setShowProctoredOnly(!showProctoredOnly)}
                className="w-full justify-start"
              >
                {showProctoredOnly ? "Show Proctored Only" : "Show All Courses"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {Array.isArray(filteredCourses) ? filteredCourses.length : 0} Course{(Array.isArray(filteredCourses) ? filteredCourses.length : 0) !== 1 ? 's' : ''} Found
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setSelectedSubject('All Subjects')
              setSelectedDifficulty('All Levels')
              setSelectedPriceRange('All Prices')
              setShowProctoredOnly(false)
            }}
          >
            Clear Filters
          </Button>
        </div>

        {!Array.isArray(filteredCourses) || filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your filters or search terms to find more courses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredCourses.map((course) => (
               <CourseCard
                 key={course.id}
                 course={{
                   id: course.id,
                   title: course.title,
                   description: course.description,
                   subject: course.subject,
                   credits: course.credits,
                   gradeLevel: course.gradeLevel,
                   modules: Array.from({ length: course.modules }, (_, i) => ({
                     id: `module-${i}`,
                     title: `Module ${i + 1}`,
                     lessons: Array.from({ length: course.totalLessons / course.modules }, (_, j) => ({
                       id: `lesson-${i}-${j}`,
                       title: `Lesson ${j + 1}`,
                       duration: 30
                     }))
                   }))
                 }}
                 enrollment={course.isEnrolled ? { id: 'enrolled', status: 'ACTIVE' } : undefined}
                 onEnrollmentSuccess={handleEnrollmentSuccess}
               />
             ))}
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      {selectedCourse && (
        <CourseEnrollmentModal
          course={selectedCourse}
          isOpen={isEnrollmentModalOpen}
          onClose={() => {
            setIsEnrollmentModalOpen(false)
            setSelectedCourse(null)
          }}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  )
} 