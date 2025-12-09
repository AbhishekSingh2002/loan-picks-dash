// =============================================================================
// WHY: AskForm component handles chat input with validation
// Provides clean interface for user to ask questions about products
// Implements client-side validation before sending to API
// =============================================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { AIAskSchema } from '@/lib/validators/schemas';
import type { Product } from '@/types';
import { z } from 'zod';

interface AskFormProps {
  product: Product;
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// =============================================================================
// WHY: AskForm component with validation and keyboard shortcuts
// Validates input using Zod before submission
// Provides good UX with auto-resize, character counter, shortcuts
// =============================================================================

export function AskForm({
  product,
  onSubmit,
  isLoading = false,
  placeholder = 'Ask about rates, eligibility, tenure...',
  maxLength = 500,
  className = ''
}: AskFormProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // WHY: Auto-focus textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // WHY: Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // =============================================================================
  // WHY: Validate input using Zod schema
  // Ensures message meets requirements before sending to API
  // =============================================================================

  const validateMessage = (msg: string): string | null => {
    try {
      AIAskSchema.parse({
        productId: product.id,
        message: msg,
      });
      return null;
    } catch (err) {
      if (err instanceof z.ZodError) {
        return err.errors[0]?.message || 'Invalid input';
      }
      return 'Validation error';
    }
  };

  // =============================================================================
  // WHY: Handle form submission
  // Validates, shows errors, calls parent onSubmit, clears form
  // =============================================================================

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // WHY: Trim whitespace for validation
    const trimmedMessage = message.trim();

    // WHY: Validate message
    const validationError = validateMessage(trimmedMessage);
    if (validationError) {
      setError(validationError);
      return;
    }

    // WHY: Clear error state
    setError(null);

    try {
      // WHY: Call parent's onSubmit handler
      await onSubmit(trimmedMessage);
      
      // WHY: Clear form on success
      setMessage('');
      
      // WHY: Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error submitting message:', err);
    }
  };

  // =============================================================================
  // WHY: Handle keyboard shortcuts
  // Enter = submit, Shift+Enter = new line
  // =============================================================================

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // =============================================================================
  // WHY: Handle message change with length validation
  // =============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    
    // WHY: Enforce max length
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
      setError(null);
    }
  };

  // WHY: Calculate character count and remaining
  const charCount = message.length;
  const charsRemaining = maxLength - charCount;
  const isNearLimit = charsRemaining <= 50;
  const canSubmit = message.trim().length > 0 && !isLoading;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-2 ${className}`}
      noValidate
    >
      {/* WHY: Textarea with validation and auto-resize */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`resize-none min-h-[44px] max-h-[200px] pr-12 ${
            error ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          rows={1}
          aria-label="Message input"
          aria-invalid={!!error}
          aria-describedby={error ? 'message-error' : 'message-help'}
        />
        
        {/* WHY: Character counter (shown when near limit) */}
        {isNearLimit && (
          <div 
            className={`absolute bottom-2 right-2 text-xs ${
              charsRemaining <= 0 ? 'text-red-500' : 'text-gray-500'
            }`}
            aria-live="polite"
          >
            {charsRemaining}
          </div>
        )}
      </div>

      {/* WHY: Error message display */}
      {error && (
        <div 
          id="message-error"
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* WHY: Help text with keyboard shortcuts */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span id="message-help">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border">Shift+Enter</kbd> for new line
        </span>
        
        {/* WHY: Submit button */}
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit}
          className="gap-2"
          aria-label="Send message"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// WHY: Compact variant for inline usage
// Simpler layout for space-constrained areas
// =============================================================================

interface CompactAskFormProps {
  product: Product;
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function CompactAskForm({ onSubmit, isLoading }: CompactAskFormProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    try {
      await onSubmit(message.trim());
      setMessage('');
    } catch (err) {
      console.error('Error submitting message:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question..."
        disabled={isLoading}
        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        maxLength={500}
      />
      <Button
        type="submit"
        size="sm"
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </form>
  );
}

// =============================================================================
// WHY: Export both variants
// =============================================================================

export default AskForm;