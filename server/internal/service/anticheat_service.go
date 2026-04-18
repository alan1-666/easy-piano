package service

import (
	"fmt"

	"github.com/alan1-666/easy-piano/server/internal/model"
)

type AntiCheatService interface {
	ValidateScore(log *model.PracticeLog, totalNotes int) error
}

type antiCheatService struct{}

func NewAntiCheatService() AntiCheatService {
	return &antiCheatService{}
}

// ValidateScore checks whether a submitted score is within plausible bounds.
// Validation formula from DESIGN.md section 7.3:
//
//	max_possible_score = total_notes * 100 * max_combo_multiplier(3.0)
//	if submitted_score > max_possible_score: reject
//	if perfect_count + great_count + good_count + miss_count != total_notes: reject
func (s *antiCheatService) ValidateScore(log *model.PracticeLog, totalNotes int) error {
	if totalNotes <= 0 {
		return nil // can't validate without note count
	}

	// Check note count consistency
	noteSum := log.PerfectCount + log.GreatCount + log.GoodCount + log.MissCount
	if noteSum != totalNotes {
		return fmt.Errorf("note count mismatch: got %d, expected %d", noteSum, totalNotes)
	}

	// Check max possible score
	maxComboMultiplier := 3.0
	maxPossibleScore := float64(totalNotes) * 100.0 * maxComboMultiplier
	if float64(log.Score) > maxPossibleScore {
		return fmt.Errorf("score %d exceeds maximum possible %d", log.Score, int(maxPossibleScore))
	}

	// Check accuracy consistency
	if totalNotes > 0 {
		expectedAccuracy := float64(log.PerfectCount+log.GreatCount+log.GoodCount) / float64(totalNotes)
		if log.Accuracy > expectedAccuracy+0.01 {
			return fmt.Errorf("accuracy inconsistency")
		}
	}

	// Check combo can't exceed note count
	if log.MaxCombo > totalNotes {
		return fmt.Errorf("max combo %d exceeds total notes %d", log.MaxCombo, totalNotes)
	}

	return nil
}
