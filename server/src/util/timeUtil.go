package util

import "time"

func IsDateBetweenOrEqual(dateToCheck time.Time, startDate time.Time, endDate time.Time) bool {
	isAfterOrEqualToStartDate := dateToCheck.After(startDate) || dateToCheck.Equal(startDate)
	isBeforeOrEqualToEndDate := dateToCheck.Before(endDate) || dateToCheck.Equal(endDate)
	return isAfterOrEqualToStartDate && isBeforeOrEqualToEndDate
}

func IsDateAfterOrEqual(dateToCheck time.Time, dateToCompare time.Time) bool {
	return dateToCheck.After(dateToCompare) || dateToCheck.Equal(dateToCompare)
}

func IsDateBeforeOrEqual(dateToCheck time.Time, dateToCompare time.Time) bool {
	return dateToCheck.Before(dateToCompare) || dateToCheck.Equal(dateToCompare)
}
