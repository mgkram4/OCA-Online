-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "attachments" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "transcript" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "CourseTeacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'instructor',
    CONSTRAINT "CourseTeacher_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CourseTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "monthlyAmount" REAL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "stripeSubscriptionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextPaymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProctoringSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
    "startTime" DATETIME,
    "endTime" DATETIME,
    "duration" INTEGER,
    "sessionData" JSONB,
    "flags" JSONB,
    "recordingUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProctoringSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "dueDate" DATETIME,
    "timeLimit" INTEGER,
    "allowLate" BOOLEAN NOT NULL DEFAULT false,
    "latePenalty" REAL,
    "requiresProctoring" BOOLEAN NOT NULL DEFAULT false,
    "proctoringSettings" JSONB,
    "questions" JSONB,
    "rubric" JSONB,
    "attachments" TEXT,
    "courseId" TEXT,
    "moduleId" TEXT,
    "lessonId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Assignment" ("allowLate", "courseId", "createdAt", "description", "dueDate", "id", "latePenalty", "lessonId", "moduleId", "points", "questions", "rubric", "timeLimit", "title", "type", "updatedAt") SELECT "allowLate", "courseId", "createdAt", "description", "dueDate", "id", "latePenalty", "lessonId", "moduleId", "points", "questions", "rubric", "timeLimit", "title", "type", "updatedAt" FROM "Assignment";
DROP TABLE "Assignment";
ALTER TABLE "new_Assignment" RENAME TO "Assignment";
CREATE INDEX "Assignment_courseId_idx" ON "Assignment"("courseId");
CREATE INDEX "Assignment_moduleId_idx" ON "Assignment"("moduleId");
CREATE INDEX "Assignment_type_idx" ON "Assignment"("type");
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "prerequisites" TEXT,
    "syllabus" TEXT,
    "thumbnail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxStudents" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "price" REAL NOT NULL DEFAULT 250.0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "requiresProctoring" BOOLEAN NOT NULL DEFAULT false,
    "proctoringType" TEXT,
    "totalHours" INTEGER,
    "difficulty" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Course" ("createdAt", "credits", "description", "endDate", "gradeLevel", "id", "isActive", "maxStudents", "prerequisites", "startDate", "subject", "syllabus", "thumbnail", "title", "updatedAt") SELECT "createdAt", "credits", "description", "endDate", "gradeLevel", "id", "isActive", "maxStudents", "prerequisites", "startDate", "subject", "syllabus", "thumbnail", "title", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE INDEX "Course_subject_idx" ON "Course"("subject");
CREATE INDEX "Course_gradeLevel_idx" ON "Course"("gradeLevel");
CREATE INDEX "Course_isActive_idx" ON "Course"("isActive");
CREATE TABLE "new_Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "completionDate" DATETIME,
    "finalGrade" TEXT,
    "gradePoints" REAL,
    "creditsEarned" INTEGER NOT NULL DEFAULT 0,
    "paymentId" TEXT,
    "paymentPlanId" TEXT,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "PaymentPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Enrollment" ("completionDate", "courseId", "creditsEarned", "endDate", "finalGrade", "gradePoints", "id", "paymentId", "startDate", "status", "userId") SELECT "completionDate", "courseId", "creditsEarned", "endDate", "finalGrade", "gradePoints", "id", "paymentId", "startDate", "status", "userId" FROM "Enrollment";
DROP TABLE "Enrollment";
ALTER TABLE "new_Enrollment" RENAME TO "Enrollment";
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");
CREATE INDEX "Enrollment_startDate_idx" ON "Enrollment"("startDate");
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content" JSONB,
    "attachments" TEXT,
    "submittedAt" DATETIME,
    "gradedAt" DATETIME,
    "score" REAL,
    "maxScore" REAL,
    "feedback" TEXT,
    "gradedBy" TEXT,
    "proctoringSessionId" TEXT,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Submission_proctoringSessionId_fkey" FOREIGN KEY ("proctoringSessionId") REFERENCES "ProctoringSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("assignmentId", "attachments", "content", "feedback", "gradedAt", "gradedBy", "id", "maxScore", "score", "status", "submittedAt", "userId") SELECT "assignmentId", "attachments", "content", "feedback", "gradedAt", "gradedBy", "id", "maxScore", "score", "status", "submittedAt", "userId" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");
CREATE UNIQUE INDEX "Submission_userId_assignmentId_key" ON "Submission"("userId", "assignmentId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "dateOfBirth" DATETIME,
    "phone" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "gradeLevel" INTEGER,
    "graduationYear" INTEGER,
    "gpa" REAL DEFAULT 0.0,
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "stripeCustomerId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationDocuments" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("address", "createdAt", "dateOfBirth", "email", "emergencyContact", "emergencyPhone", "gpa", "gradeLevel", "graduationYear", "hashedPassword", "id", "name", "parentId", "phone", "role", "totalCredits", "updatedAt") SELECT "address", "createdAt", "dateOfBirth", "email", "emergencyContact", "emergencyPhone", "gpa", "gradeLevel", "graduationYear", "hashedPassword", "id", "name", "parentId", "phone", "role", "totalCredits", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_gradeLevel_idx" ON "User"("gradeLevel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CourseTeacher_teacherId_idx" ON "CourseTeacher"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseTeacher_courseId_teacherId_key" ON "CourseTeacher"("courseId", "teacherId");

-- CreateIndex
CREATE INDEX "PaymentPlan_userId_idx" ON "PaymentPlan"("userId");

-- CreateIndex
CREATE INDEX "PaymentPlan_isActive_idx" ON "PaymentPlan"("isActive");

-- CreateIndex
CREATE INDEX "ProctoringSession_userId_idx" ON "ProctoringSession"("userId");

-- CreateIndex
CREATE INDEX "ProctoringSession_status_idx" ON "ProctoringSession"("status");

-- CreateIndex
CREATE INDEX "ProctoringSession_startTime_idx" ON "ProctoringSession"("startTime");

-- CreateIndex
CREATE INDEX "Attendance_userId_idx" ON "Attendance"("userId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
