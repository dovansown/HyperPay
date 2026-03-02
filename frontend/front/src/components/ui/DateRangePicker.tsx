import { useState, useMemo, useEffect, useRef } from 'react'

interface DateRangePickerProps {
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (startDate: Date | null, endDate: Date | null) => void
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
]

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Nếu đã có startDate, hiển thị tháng của startDate
    // Nếu chưa có, hiển thị tháng hiện tại
    if (startDate) {
      return new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    }
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  // Tự động điều hướng đến tháng chứa startDate hoặc endDate khi chọn
  useEffect(() => {
    if (startDate && !endDate) {
      // Nếu đã chọn startDate nhưng chưa chọn endDate, hiển thị tháng của startDate
      const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      if (
        currentMonth.getFullYear() !== startMonth.getFullYear() ||
        currentMonth.getMonth() !== startMonth.getMonth()
      ) {
        setCurrentMonth(startMonth)
      }
    } else if (endDate) {
      // Nếu đã chọn cả 2, hiển thị tháng của endDate (hoặc startDate nếu cùng tháng)
      const targetDate = endDate
      const targetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      if (
        currentMonth.getFullYear() !== targetMonth.getFullYear() ||
        currentMonth.getMonth() !== targetMonth.getMonth()
      ) {
        setCurrentMonth(targetMonth)
      }
    }
  }, [startDate, endDate])

  // Tạo danh sách năm (từ năm hiện tại - 10 đến năm hiện tại + 10)
  const years = useMemo(() => {
    const currentYear = now.getFullYear()
    const yearList = []
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      yearList.push(i)
    }
    return yearList
  }, [])

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const [isMonthOpen, setIsMonthOpen] = useState(false)
  const [isYearOpen, setIsYearOpen] = useState(false)
  const monthRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(event.target as Node)) {
        setIsMonthOpen(false)
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setIsYearOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
    setIsMonthOpen(false)
  }

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(year)
    setCurrentMonth(newDate)
    setIsYearOpen(false)
  }

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Bắt đầu chọn lại từ đầu
      onChange?.(date, null)
      // Tự động điều hướng đến tháng của ngày vừa chọn
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    } else if (!endDate) {
      // Chọn endDate
      if (date >= startDate) {
        onChange?.(startDate, date)
        // Tự động điều hướng đến tháng của endDate nếu khác tháng
        const endMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
        if (
          endMonth.getFullYear() !== startMonth.getFullYear() ||
          endMonth.getMonth() !== startMonth.getMonth()
        ) {
          setCurrentMonth(endMonth)
        }
      } else {
        // Nếu chọn ngày trước startDate, đặt làm startDate mới
        onChange?.(date, null)
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      }
    }
  }

  const isDateInRange = (date: Date) => {
    if (!startDate) return false
    if (!endDate) {
      return date.toDateString() === startDate.toDateString()
    }
    return date >= startDate && date <= endDate
  }

  const isDateStart = (date: Date) => {
    return startDate?.toDateString() === date.toDateString()
  }

  const isDateEnd = (date: Date) => {
    return endDate?.toDateString() === date.toDateString()
  }

  const isDateInMiddle = (date: Date) => {
    if (!startDate || !endDate) return false
    return date > startDate && date < endDate
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
  }

  const year = currentMonth.getFullYear()
  const monthIndex = currentMonth.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: (Date | null)[] = []
  // Thêm các ngày trống ở đầu
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  // Thêm các ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, monthIndex, day))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Text hiển thị range đã chọn */}
      <div className="text-center">
        {startDate && endDate ? (
          <p className="text-sm font-bold text-[#898361]">
            Đã chọn: <span className="text-[#181711] dark:text-white">{formatDate(startDate)}</span> - <span className="text-[#181711] dark:text-white">{formatDate(endDate)}</span>
          </p>
        ) : startDate ? (
          <p className="text-sm font-bold text-[#898361]">
            Đã chọn: <span className="text-[#181711] dark:text-white">{formatDate(startDate)}</span> - Chọn ngày kết thúc
          </p>
        ) : (
          <p className="text-sm font-bold text-[#898361]">
            Chọn ngày bắt đầu và ngày kết thúc
          </p>
        )}
      </div>

      {/* Calendar */}
      <div className="flex min-w-72 max-w-[336px] mx-auto flex-col gap-0.5">
        <div className="flex items-center p-1 justify-between mb-2">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="hover:bg-background-light dark:hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          {/* Custom Dropdown chọn tháng và năm */}
          <div className="flex items-center gap-2">
            {/* Month Dropdown */}
            <div className="relative" ref={monthRef}>
              <button
                type="button"
                onClick={() => {
                  setIsMonthOpen(!isMonthOpen)
                  setIsYearOpen(false)
                }}
                className="flex items-center gap-2 bg-white dark:bg-[#2d2a1a] border border-[#eae5cd] dark:border-white/10 rounded-lg px-4 py-2 text-sm font-bold text-[#181711] dark:text-white cursor-pointer hover:border-primary/50 dark:hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:shadow-md min-w-[120px] justify-between"
              >
                <span>{monthNames[monthIndex]}</span>
                <span
                  className={`material-symbols-outlined text-lg text-[#898361] dark:text-white/60 transition-transform ${
                    isMonthOpen ? 'rotate-180' : ''
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>
              {isMonthOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#2d2a1a] border border-[#eae5cd] dark:border-white/10 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto transform transition-all duration-200 ease-out opacity-100 translate-y-0">
                  {monthNames.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleMonthChange(idx)}
                      className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        idx === monthIndex
                          ? 'bg-primary/20 text-[#181711] dark:text-white'
                          : 'text-[#181711] dark:text-white hover:bg-background-light dark:hover:bg-white/10'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative" ref={yearRef}>
              <button
                type="button"
                onClick={() => {
                  setIsYearOpen(!isYearOpen)
                  setIsMonthOpen(false)
                }}
                className="flex items-center gap-2 bg-white dark:bg-[#2d2a1a] border border-[#eae5cd] dark:border-white/10 rounded-lg px-4 py-2 text-sm font-bold text-[#181711] dark:text-white cursor-pointer hover:border-primary/50 dark:hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:shadow-md min-w-[100px] justify-between"
              >
                <span>{year}</span>
                <span
                  className={`material-symbols-outlined text-lg text-[#898361] dark:text-white/60 transition-transform ${
                    isYearOpen ? 'rotate-180' : ''
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>
              {isYearOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#2d2a1a] border border-[#eae5cd] dark:border-white/10 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto transform transition-all duration-200 ease-out opacity-100 translate-y-0">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(y)}
                      className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        y === year
                          ? 'bg-primary/20 text-[#181711] dark:text-white'
                          : 'text-[#181711] dark:text-white hover:bg-background-light dark:hover:bg-white/10'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className="hover:bg-background-light dark:hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        
        <div className="grid grid-cols-7 text-center">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="text-[13px] font-bold h-10 flex items-center justify-center opacity-50"
            >
              {day}
            </div>
          ))}
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="h-10" />
            }

            const isInRange = isDateInRange(date)
            const isStart = isDateStart(date)
            const isEnd = isDateEnd(date)
            const isMiddle = isDateInMiddle(date)

            let className = 'h-10 flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors'
            
            if (isStart && isEnd) {
              // Chỉ chọn 1 ngày
              className += ' bg-primary text-black font-bold rounded-full'
            } else if (isStart) {
              className += ' bg-primary/20 rounded-l-full'
            } else if (isEnd) {
              className += ' bg-primary/20 rounded-r-full'
            } else if (isMiddle) {
              className += ' bg-primary/20'
            }

            return (
              <button
                key={date.toDateString()}
                type="button"
                onClick={() => handleDateClick(date)}
                className={className}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DateRangePicker
