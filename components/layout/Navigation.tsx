'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { useClerk } from '@clerk/nextjs'
import {
    BarChart3,
    BookOpen,
    FileText,
    GraduationCap,
    LogOut,
    Menu,
    MessageCircle,
    Trophy,
    Users,
    X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navigation() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: user?.role === 'TEACHER' ? '/teacher' : user?.role === 'ADMIN' ? '/admin' : user?.role === 'PARENT' ? '/parent' : '/dashboard',
        icon: BarChart3
      }
    ]

    if (user?.role === 'STUDENT') {
      return [
        ...baseItems,
        {
          name: 'Courses',
          href: '/courses',
          icon: BookOpen
        },
        {
          name: 'Chat',
          href: '/chat',
          icon: MessageCircle
        },
        {
          name: 'Progress',
          href: '/progress',
          icon: Trophy
        }
      ]
    } else if (user?.role === 'TEACHER') {
      return [
        ...baseItems,
        {
          name: 'My Courses',
          href: '/courses',
          icon: BookOpen
        },
        {
          name: 'Students',
          href: '/teacher/students',
          icon: Users
        },
        {
          name: 'Assignments',
          href: '/teacher/assignments',
          icon: FileText
        }
      ]
    } else if (user?.role === 'ADMIN') {
      return [
        ...baseItems,
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users
        },
        {
          name: 'Courses',
          href: '/admin/courses',
          icon: BookOpen
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3
        }
      ]
    } else if (user?.role === 'PARENT') {
      return [
        ...baseItems,
        {
          name: 'My Children',
          href: '/parent/children',
          icon: Users
        },
        {
          name: 'Progress',
          href: '/parent/progress',
          icon: Trophy
        }
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                OCA WebSchool
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:flex md:items-center md:ml-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Mobile User Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 