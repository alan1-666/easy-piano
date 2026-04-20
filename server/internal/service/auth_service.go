package service

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/alan1-666/easy-piano/server/internal/config"
	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(username, email, phone, password string) (*model.User, string, string, error)
	Login(email, password string) (*model.User, string, string, error)
	RefreshToken(refreshToken string) (string, string, error)
	AppleLogin(identityToken string) (*model.User, string, string, error)
	WechatLogin(code string) (*model.User, string, string, error)
}

type authService struct {
	db         *gorm.DB
	jwtSecret  string
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewAuthService(db *gorm.DB, cfg config.JWTConfig) AuthService {
	return &authService{
		db:         db,
		jwtSecret:  cfg.Secret,
		accessTTL:  time.Duration(cfg.AccessTokenTTL) * time.Second,
		refreshTTL: time.Duration(cfg.RefreshTokenTTL) * time.Second,
	}
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func (s *authService) Register(username, email, phone, password string) (*model.User, string, string, error) {
	// Validate inputs
	if len(username) < 2 {
		return nil, "", "", fmt.Errorf("username must be at least 2 characters")
	}
	if !emailRegex.MatchString(email) {
		return nil, "", "", fmt.Errorf("invalid email format")
	}
	if len(password) < 8 {
		return nil, "", "", fmt.Errorf("password must be at least 8 characters")
	}

	// Check email uniqueness
	var existing model.User
	if err := s.db.Where("email = ?", email).First(&existing).Error; err == nil {
		return nil, "", "", fmt.Errorf("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user — phone is only written when non-empty so the UNIQUE
	// index stays NULL rather than '' for users who didn't provide one.
	user := model.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
	}
	if phone != "" {
		user.Phone = &phone
	}
	if err := s.db.Create(&user).Error; err != nil {
		return nil, "", "", fmt.Errorf("failed to create user: %w", err)
	}

	// Create default UserSettings
	settings := model.UserSettings{
		UserID: user.ID,
	}
	if err := s.db.Create(&settings).Error; err != nil {
		// Non-fatal: log but don't fail registration
		fmt.Printf("warning: failed to create default user settings: %v\n", err)
	}

	// Generate tokens
	accessToken, refreshToken, err := s.generateTokens(user.ID)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &user, accessToken, refreshToken, nil
}

func (s *authService) Login(email, password string) (*model.User, string, string, error) {
	var user model.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, "", "", fmt.Errorf("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", "", fmt.Errorf("invalid email or password")
	}

	accessToken, refreshToken, err := s.generateTokens(user.ID)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &user, accessToken, refreshToken, nil
}

func (s *authService) RefreshToken(refreshToken string) (string, string, error) {
	userID, err := s.parseToken(refreshToken, "refresh")
	if err != nil {
		return "", "", fmt.Errorf("invalid refresh token: %w", err)
	}

	// Verify user still exists
	var user model.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return "", "", fmt.Errorf("user not found")
	}

	return s.generateTokens(user.ID)
}

func (s *authService) AppleLogin(identityToken string) (*model.User, string, string, error) {
	// Simplified: decode JWT payload without full Apple public key verification
	// In production, verify with Apple's public keys from https://appleid.apple.com/auth/keys
	parts := strings.Split(identityToken, ".")
	if len(parts) != 3 {
		return nil, "", "", fmt.Errorf("invalid identity token format")
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to decode identity token: %w", err)
	}

	var claims struct {
		Sub   string `json:"sub"`
		Email string `json:"email"`
	}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, "", "", fmt.Errorf("failed to parse identity token claims: %w", err)
	}

	if claims.Sub == "" {
		return nil, "", "", fmt.Errorf("missing subject in identity token")
	}

	// Find or create user by AppleID
	var user model.User
	err = s.db.Where("apple_id = ?", claims.Sub).First(&user).Error
	if err != nil {
		// User doesn't exist, create one
		appleID := claims.Sub
		user = model.User{
			AppleID:  &appleID,
			Email:    claims.Email,
			Username: "Apple User",
		}
		if err := s.db.Create(&user).Error; err != nil {
			return nil, "", "", fmt.Errorf("failed to create user: %w", err)
		}

		// Create default UserSettings
		settings := model.UserSettings{
			UserID: user.ID,
		}
		s.db.Create(&settings) // best effort
	}

	accessToken, refreshToken, err := s.generateTokens(user.ID)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &user, accessToken, refreshToken, nil
}

func (s *authService) WechatLogin(code string) (*model.User, string, string, error) {
	return nil, "", "", fmt.Errorf("WeChat login not yet implemented")
}

func (s *authService) generateTokens(userID uint) (string, string, error) {
	accessClaims := jwt.MapClaims{
		"user_id": userID,
		"type":    "access",
		"exp":     time.Now().Add(s.accessTTL).Unix(),
		"iat":     time.Now().Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", err
	}

	refreshClaims := jwt.MapClaims{
		"user_id": userID,
		"type":    "refresh",
		"exp":     time.Now().Add(s.refreshTTL).Unix(),
		"iat":     time.Now().Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", err
	}

	return accessStr, refreshStr, nil
}

func (s *authService) parseToken(tokenStr string, expectedType string) (uint, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return 0, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return 0, fmt.Errorf("invalid token")
	}
	tokenType, _ := claims["type"].(string)
	if tokenType != expectedType {
		return 0, fmt.Errorf("wrong token type")
	}
	userID := uint(claims["user_id"].(float64))
	return userID, nil
}
