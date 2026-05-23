import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {finalize} from 'rxjs';
import {DashboardService} from '../../../core/services/dashboard.service';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  confidenceScore?: number;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.html',
  styleUrl: './chatbot-widget.scss'
})
export class ChatbotWidget implements AfterViewChecked {
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;

  isOpen = false;
  message = '';
  loading = false;
  private shouldScrollToBottom = false;

  messages: ChatMessage[] = [
    {
      sender: 'bot',
      text: 'Hi! I can help you with leads, performance, fraud alerts, AI predictions, recommendations, and user roles.'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.shouldScrollToBottom = true;
  }

  sendMessage(): void {
    const trimmedMessage = this.message.trim();

    if (!trimmedMessage || this.loading) {
      return;
    }

    this.messages = [
      ...this.messages,
      {
        sender: 'user',
        text: trimmedMessage
      }
    ];

    this.message = '';
    this.loading = true;
    this.shouldScrollToBottom = true;

    this.dashboardService.askChatbot(trimmedMessage)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Chatbot response:', response);

          this.messages = [
            ...this.messages,
            {
              sender: 'bot',
              text: response?.reply || 'Sorry, I could not understand the response.',
              confidenceScore: response?.confidenceScore
            }
          ];

          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Chatbot error:', error);

          this.messages = [
            ...this.messages,
            {
              sender: 'bot',
              text: 'Sorry, I could not connect to the chatbot service. Please try again later.'
            }
          ];

          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        }
      });
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatBody?.nativeElement) {
        const element = this.chatBody.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }
}
