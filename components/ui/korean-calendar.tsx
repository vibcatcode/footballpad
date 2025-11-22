"use client"

import * as React from "react"
import type { Locale } from "date-fns"
import { ko } from "date-fns/locale"
import type { Formatters } from "react-day-picker"

import type { CalendarProps } from "@/components/ui/calendar"
import { Calendar } from "@/components/ui/calendar"

const FALLBACK_WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const

export type KoreanCalendarProps = CalendarProps

export function KoreanCalendar({
  locale = ko,
  weekStartsOn = 0,
  formatters,
  ...props
}: KoreanCalendarProps) {
  const defaultFormatters = React.useMemo<Partial<Formatters>>(
    () => ({
      formatWeekdayName: (date, options) => {
        const activeLocale: Locale | undefined = options?.locale ?? locale
        const localized =
          activeLocale?.localize?.day?.(date.getDay(), { width: "narrow" })

        if (localized) {
          return localized
        }

        return FALLBACK_WEEKDAY_LABELS[date.getDay()]
      },
      formatCaption: (date) =>
        `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
    }),
    [locale]
  )

  const mergedFormatters = React.useMemo(
    () => ({
      ...defaultFormatters,
      ...formatters,
    }),
    [defaultFormatters, formatters]
  )

  return (
    <Calendar
      locale={locale}
      weekStartsOn={weekStartsOn}
      formatters={mergedFormatters}
      {...props}
    />
  )
}

