package util

import "time"

func IsDateBetween(dateToCheck time.Time, startDate time.Time, endDate time.Time) bool {
	isAfterOrEqualToStartDate := dateToCheck.After(startDate) || dateToCheck.Equal(startDate)
	isBeforeOrEqualToEndDate := dateToCheck.Before(endDate) || dateToCheck.Equal(endDate)
	return isAfterOrEqualToStartDate || isBeforeOrEqualToEndDate
}
