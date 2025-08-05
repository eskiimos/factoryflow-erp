"use client"

import { useState, useCallback } from 'react'

export function useSafeSubmit<T>(onSubmit: (data: T) => Promise<void>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = useCallback(async (data: T) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      return Promise.resolve()
    } catch (error) {
      console.error('Form submission error:', error)
      return Promise.reject(error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit])

  return { handleSubmit, isSubmitting }
}
