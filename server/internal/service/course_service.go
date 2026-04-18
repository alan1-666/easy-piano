package service

import (
	"time"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type CourseService interface {
	GetCourses() ([]model.Course, error)
	GetLessons(courseID uint) ([]model.Lesson, error)
	GetLesson(lessonID uint) (*model.Lesson, error)
	CompleteLesson(userID, lessonID uint, score int) (*model.UserProgress, error)
}

type courseService struct {
	db *gorm.DB
}

func NewCourseService(db *gorm.DB) CourseService {
	return &courseService{db: db}
}

func (s *courseService) GetCourses() ([]model.Course, error) {
	var courses []model.Course
	err := s.db.Order("level, order_index").Find(&courses).Error
	return courses, err
}

func (s *courseService) GetLessons(courseID uint) ([]model.Lesson, error) {
	var lessons []model.Lesson
	err := s.db.Where("course_id = ?", courseID).Order("order_index").Find(&lessons).Error
	return lessons, err
}

func (s *courseService) GetLesson(lessonID uint) (*model.Lesson, error) {
	var lesson model.Lesson
	err := s.db.First(&lesson, lessonID).Error
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (s *courseService) CompleteLesson(userID, lessonID uint, score int) (*model.UserProgress, error) {
	stars := 0
	if score >= 60 {
		stars = 1
	}
	if score >= 80 {
		stars = 2
	}
	if score >= 95 {
		stars = 3
	}

	var progress model.UserProgress
	err := s.db.Where("user_id = ? AND lesson_id = ?", userID, lessonID).First(&progress).Error

	now := time.Now()
	if err != nil {
		progress = model.UserProgress{
			UserID:      userID,
			LessonID:    lessonID,
			Status:      "completed",
			BestScore:   &score,
			Stars:       stars,
			Attempts:    1,
			CompletedAt: &now,
		}
		s.db.Create(&progress)
	} else {
		progress.Attempts++
		if progress.BestScore == nil || score > *progress.BestScore {
			progress.BestScore = &score
		}
		if stars > progress.Stars {
			progress.Stars = stars
		}
		if progress.Status != "completed" {
			progress.Status = "completed"
			progress.CompletedAt = &now
		}
		s.db.Save(&progress)
	}

	s.unlockNextLesson(userID, lessonID)

	xp := 100 * stars
	s.db.Model(&model.User{}).Where("id = ?", userID).Update("xp", gorm.Expr("xp + ?", xp))

	return &progress, nil
}

func (s *courseService) unlockNextLesson(userID, currentLessonID uint) {
	var current model.Lesson
	if s.db.First(&current, currentLessonID).Error != nil {
		return
	}
	var next model.Lesson
	err := s.db.Where("course_id = ? AND order_index > ?", current.CourseID, current.OrderIndex).
		Order("order_index").First(&next).Error
	if err != nil {
		return
	}
	s.db.Where("user_id = ? AND lesson_id = ?", userID, next.ID).
		Assign(model.UserProgress{Status: "unlocked"}).
		FirstOrCreate(&model.UserProgress{UserID: userID, LessonID: next.ID, Status: "unlocked"})
}
