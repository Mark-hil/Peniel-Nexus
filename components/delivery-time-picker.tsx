'use client';

import * as React from 'react';
import {
  format,
  isToday,
  isTomorrow,
  addDays,
  startOfToday,
  isBefore,
  isAfter,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Zap,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface DeliveryTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

interface TimeSlot {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  isAsap?: boolean;
}

const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'asap',
    label: 'ASAP',
    sublabel: 'Within 1–2 hours',
    icon: Zap,
    isAsap: true,
  },
  {
    id: 'morning',
    label: 'Morning',
    sublabel: '8:00 AM – 11:00 AM',
    icon: Sunrise,
  },
  {
    id: 'midday',
    label: 'Midday',
    sublabel: '11:00 AM – 2:00 PM',
    icon: Sun,
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    sublabel: '2:00 PM – 5:00 PM',
    icon: Sunset,
  },
  {
    id: 'evening',
    label: 'Evening',
    sublabel: '5:00 PM – 8:00 PM',
    icon: Moon,
  },
];

function format12Hour(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const minutesPad = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minutesPad} ${ampm}`;
}

export function DeliveryTimePicker({
  value,
  onChange,
  required,
  className,
}: DeliveryTimePickerProps) {
  const today = React.useMemo(() => startOfToday(), []);
  const maxDate = React.useMemo(() => addDays(today, 30), [today]);

  const [date, setDate] = React.useState<Date | undefined>(() => {
    // Default to today
    return today;
  });

  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>('afternoon');
  const [isCustomTime, setIsCustomTime] = React.useState(false);
  const [customTime, setCustomTime] = React.useState('14:00');

  // Helper to compute formatted date label
  const getDateLabel = React.useCallback(
    (d: Date | undefined): string => {
      if (!d) return 'Select date';
      if (isToday(d)) return `Today (${format(d, 'EEE, MMM d')})`;
      if (isTomorrow(d)) return `Tomorrow (${format(d, 'EEE, MMM d')})`;
      return format(d, 'EEE, MMM d, yyyy');
    },
    []
  );

  // Sync composed string up to parent
  const updateDeliveryTime = React.useCallback(
    (newDate: Date | undefined, slotId: string, customVal: string, isCustom: boolean) => {
      if (!newDate) {
        onChange('');
        return;
      }

      let datePrefix = '';
      if (isToday(newDate)) {
        datePrefix = `Today (${format(newDate, 'MMM d')})`;
      } else if (isTomorrow(newDate)) {
        datePrefix = `Tomorrow (${format(newDate, 'MMM d')})`;
      } else {
        datePrefix = format(newDate, 'EEE, MMM d');
      }

      let timePart = '';
      if (isCustom) {
        timePart = customVal ? format12Hour(customVal) : 'Custom Time';
      } else {
        const slot = TIME_SLOTS.find((s) => s.id === slotId);
        if (slot) {
          timePart = `${slot.label} (${slot.sublabel})`;
        }
      }

      const combined = `${datePrefix} · ${timePart}`;
      onChange(combined);
    },
    [onChange]
  );

  // Initialize value once on mount if empty
  React.useEffect(() => {
    if (!value && date) {
      updateDeliveryTime(date, selectedSlotId, customTime, isCustomTime);
    }
  }, [value, date, selectedSlotId, customTime, isCustomTime, updateDeliveryTime]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    setCalendarOpen(false);
    updateDeliveryTime(newDate, selectedSlotId, customTime, isCustomTime);
  };

  const handleQuickDate = (quickDate: Date) => {
    setDate(quickDate);
    setCalendarOpen(false);
    updateDeliveryTime(quickDate, selectedSlotId, customTime, isCustomTime);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
    setIsCustomTime(false);
    updateDeliveryTime(date, slotId, customTime, false);
  };

  const handleCustomTimeToggle = () => {
    setIsCustomTime(true);
    setSelectedSlotId('');
    updateDeliveryTime(date, '', customTime, true);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomTime(val);
    updateDeliveryTime(date, '', val, true);
  };

  return (
    <div className={cn('space-y-3.5', className)}>
      {/* Date Selection Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">1. Choose Delivery Date</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant={date && isToday(date) ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-7 px-2.5 text-xs font-normal',
                date && isToday(date) && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={() => handleQuickDate(today)}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={date && isTomorrow(date) ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-7 px-2.5 text-xs font-normal',
                date && isTomorrow(date) && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
              onClick={() => handleQuickDate(addDays(today, 1))}
            >
              Tomorrow
            </Button>
          </div>
        </div>

        {/* Date Picker Popover */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal h-10 border-input hover:bg-accent/40',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
              <span className="truncate">
                {date ? getDateLabel(date) : 'Pick a delivery date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(d) => isBefore(d, today) || isAfter(d, maxDate)}
              initialFocus
            />
            <div className="border-t border-border/60 p-2 text-center text-xs text-muted-foreground">
              Market orders can be scheduled up to 30 days ahead
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Slot Selection Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">2. Choose Delivery Window</span>
          {isCustomTime && (
            <span className="text-[11px] text-primary font-medium">Specific time selected</span>
          )}
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TIME_SLOTS.map((slot) => {
            const Icon = slot.icon;
            const isSelected = !isCustomTime && selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleSlotSelect(slot.id)}
                className={cn(
                  'flex flex-col items-start rounded-lg border p-2.5 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                    : 'border-border/70 bg-card hover:border-border hover:bg-accent/30 text-card-foreground'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    {slot.label}
                  </span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
                  {slot.sublabel}
                </span>
              </button>
            );
          })}

          {/* Custom Time Option Button */}
          <button
            type="button"
            onClick={handleCustomTimeToggle}
            className={cn(
              'flex flex-col items-start rounded-lg border p-2.5 text-left transition-all',
              isCustomTime
                ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                : 'border-border/70 bg-card hover:border-border hover:bg-accent/30 text-card-foreground'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Timer className={cn('h-3.5 w-3.5', isCustomTime ? 'text-primary' : 'text-muted-foreground')} />
                Specific Time
              </span>
              {isCustomTime && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
            </div>
            <span className="mt-1 text-[11px] text-muted-foreground leading-tight">
              {isCustomTime ? format12Hour(customTime) : 'Set exact time'}
            </span>
          </button>
        </div>

        {/* Custom Exact Time Input (visible when Specific Time is active) */}
        {isCustomTime && (
          <div className="mt-2.5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1">
              <label htmlFor="custom-time-input" className="block text-xs font-medium text-foreground mb-1">
                Select Exact Delivery Time
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="custom-time-input"
                  type="time"
                  value={customTime}
                  onChange={handleCustomTimeChange}
                  className="h-9 w-40 bg-background text-sm"
                  min="07:00"
                  max="21:00"
                  step="900"
                />
                <span className="text-xs text-muted-foreground">
                  ({format12Hour(customTime)})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Time Summary Card */}
      {value && (
        <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-xs text-foreground">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 leading-snug">
            <span className="text-muted-foreground">Scheduled delivery: </span>
            <span className="font-semibold text-primary">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
