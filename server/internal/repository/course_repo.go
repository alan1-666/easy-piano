package repository

import (
	"github.com/alan1-666/easy-piano/server/internal/model"
	"gorm.io/gorm"
)

type CourseRepository interface {
	FindAll() ([]model.Course, error)
	FindByID(id uint) (*model.Course, error)
	FindLessons(courseID uint) ([]model.Lesson, error)
	FindLessonByID(id uint) (*model.Lesson, error)
}

type courseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) FindAll() ([]model.Course, error) {
	var courses []model.Course
	err := r.db.Order("order_index").Find(&courses).Error
	return courses, err
}

func (r *courseRepository) FindByID(id uint) (*model.Course, error) {
	var course model.Course
	err := r.db.First(&course, id).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *courseRepository) FindLessons(courseID uint) ([]model.Lesson, error) {
	var lessons []model.Lesson
	err := r.db.Where("course_id = ?", courseID).Order("order_index").Find(&lessons).Error
	return lessons, err
}

func (r *courseRepository) FindLessonByID(id uint) (*model.Lesson, error) {
	var lesson model.Lesson
	err := r.db.First(&lesson, id).Error
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}
