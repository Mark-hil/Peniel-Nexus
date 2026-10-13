'use client';

import * as React from 'react';
import { Send, Phone, Video, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  recipientRole: string;
  recipientAvatar?: string;
  recipientInitials: string;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

export function ChatPanel({
  open,
  onClose,
  recipientName,
  recipientRole,
  recipientAvatar,
  recipientInitials,
  messages,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-background shadow-2xl sm:h-[600px] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/60 p-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            {recipientAvatar && <AvatarImage src={recipientAvatar} />}
            <AvatarFallback>{recipientInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">{recipientName}</p>
            <p className="text-xs text-success">{recipientRole} · Online</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="mt-1 text-xs">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                    msg.sender === 'me'
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground',
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      'mt-1 text-[10px]',
                      msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick replies */}
        <div className="flex gap-2 overflow-x-auto border-t border-border/60 px-4 pt-3 scrollbar-thin">
          {["I'm on my way", 'Almost there', 'Please call me', 'Thank you!'].map((quick) => (
            <button
              key={quick}
              onClick={() => onSend(quick)}
              className="shrink-0 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs transition-colors hover:bg-primary/5 hover:text-primary"
            >
              {quick}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-4">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
