'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

export default function ReminderForm({ subjects }) {
  const [date, setDate] = useState(new Date())
  const [selectedSubject, setSelectedSubject] = useState('')
  const [reminderType, setReminderType] = useState('email')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examDate: date,
          subject: selectedSubject,
          reminderType,
          phoneNumber: reminderType === 'sms' || reminderType === 'both' ? phoneNumber : undefined
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => setIsSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error setting reminder:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Exam Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Reminder Type
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={reminderType === 'email'}
              onChange={() => setReminderType('email')}
            />
            <span className="dark:text-gray-300">Email</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={reminderType === 'sms'}
              onChange={() => setReminderType('sms')}
            />
            <span className="dark:text-gray-300">SMS</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={reminderType === 'both'}
              onChange={() => setReminderType('both')}
            />
            <span className="dark:text-gray-300">Both</span>
          </label>
        </div>
      </div>

      {(reminderType === 'sms' || reminderType === 'both') && (
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+1234567890"
            required={reminderType === 'sms' || reminderType === 'both'}
          />
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Setting Reminder...' : 'Set Reminder'}
      </Button>

      {isSuccess && (
        <div className="p-2 bg-green-100 text-green-800 rounded-md text-center">
          Reminder set successfully!
        </div>
      )}
    </form>
  )
}