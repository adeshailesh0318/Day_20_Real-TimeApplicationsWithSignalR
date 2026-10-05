import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent
  implements OnInit, AfterViewChecked {

  @ViewChild('messageContainer')
  messageContainer!: ElementRef;

  userName = '';

  messageText = '';

  messages: ChatMessage[] = [];

  isConnected = false;

  typingUser = '';

  private shouldScroll = false;

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit(): void {

    const savedUser =
      localStorage.getItem('chatUser');

    if (savedUser) {
      this.userName = savedUser;
    }
  }

  joinChat(): void {

    if (!this.userName.trim()) {
      return;
    }

    this.userName =
      this.userName.trim();

    localStorage.setItem(
      'chatUser',
      this.userName
    );

    this.chatService
      .startConnection()
      .then(() => {

        this.isConnected = true;

        this.registerSignalREvents();

      })
      .catch(error => {

        console.error(error);

        this.isConnected = false;

        alert(
          'Could not connect to chat server.'
        );
      });
  }

  registerSignalREvents(): void {

    this.chatService.receiveMessage(
      (message: ChatMessage) => {

        this.messages.push(message);

        this.shouldScroll = true;
      }
    );

    this.chatService.loadMessages(
      (messages: ChatMessage[]) => {

        this.messages = messages;

        this.shouldScroll = true;
      }
    );

    this.chatService.userTyping(
      (user: string) => {

        this.typingUser = user;
      }
    );

    this.chatService.userStoppedTyping(
      () => {

        this.typingUser = '';
      }
    );
  }

  sendMessage(): void {

    const message =
      this.messageText.trim();

    if (!message || !this.isConnected) {
      return;
    }

    this.chatService
      .sendMessage(
        this.userName,
        message
      )
      .then(() => {

        this.messageText = '';

        this.stopTyping();
      })
      .catch(error => {

        console.error(
          'Message sending failed:',
          error
        );
      });
  }

  onKeyDown(event: KeyboardEvent): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      this.sendMessage();
    }
  }

  onTyping(): void {

    if (!this.isConnected) {
      return;
    }

    if (!this.messageText.trim()) {

      this.stopTyping();

      return;
    }

    this.chatService
      .sendTyping(this.userName)
      .catch(error => {

        console.error(error);
      });
  }

  stopTyping(): void {

    if (!this.isConnected) {
      return;
    }

    this.chatService
      .stopTyping(this.userName)
      .catch(error => {

        console.error(error);
      });
  }

  isMyMessage(
    message: ChatMessage
  ): boolean {

    return message.user === this.userName;
  }

  getInitials(
    user: string
  ): string {

    if (!user) {
      return '?';
    }

    return user
      .substring(0, 2)
      .toUpperCase();
  }

  formatTime(
    timestamp: string
  ): string {

    return new Date(timestamp)
      .toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
  }

  clearChat(): void {

    this.messages = [];
  }

  leaveChat(): void {

    window.location.reload();
  }

  ngAfterViewChecked(): void {

    if (
      this.shouldScroll &&
      this.messageContainer
    ) {

      const element =
        this.messageContainer.nativeElement;

      element.scrollTop =
        element.scrollHeight;

      this.shouldScroll = false;
    }
  }
}