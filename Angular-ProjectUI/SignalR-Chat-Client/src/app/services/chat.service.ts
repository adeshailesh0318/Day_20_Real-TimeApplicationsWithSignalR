import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr';

import { ChatMessage } from '../models/chat-message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private hubConnection!: HubConnection;

  private hubUrl = 'https://localhost:7260/chatHub';

  constructor() {
  }

  startConnection(): Promise<void> {

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR connection started');
      })
      .catch(error => {
        console.error(
          'SignalR connection failed:',
          error
        );

        throw error;
      });
  }

  receiveMessage(
    callback: (message: ChatMessage) => void
  ): void {

    this.hubConnection.on(
      'ReceiveMessage',
      (message: ChatMessage) => {

        callback(message);
      }
    );
  }

  loadMessages(
    callback: (messages: ChatMessage[]) => void
  ): void {

    this.hubConnection.on(
      'LoadMessages',
      (messages: ChatMessage[]) => {

        callback(messages);
      }
    );
  }

  userTyping(
    callback: (user: string) => void
  ): void {

    this.hubConnection.on(
      'UserTyping',
      (user: string) => {

        callback(user);
      }
    );
  }

  userStoppedTyping(
    callback: () => void
  ): void {

    this.hubConnection.on(
      'UserStoppedTyping',
      () => {

        callback();
      }
    );
  }

  userConnected(
    callback: () => void
  ): void {

    this.hubConnection.on(
      'UserConnected',
      () => {

        callback();
      }
    );
  }

  userDisconnected(
    callback: () => void
  ): void {

    this.hubConnection.on(
      'UserDisconnected',
      () => {

        callback();
      }
    );
  }

  sendMessage(
    user: string,
    message: string
  ): Promise<void> {

    return this.hubConnection.invoke(
      'SendMessage',
      user,
      message
    );
  }

  sendTyping(user: string): Promise<void> {

    return this.hubConnection.invoke(
      'SendTyping',
      user
    );
  }

  stopTyping(user: string): Promise<void> {

    return this.hubConnection.invoke(
      'StopTyping',
      user
    );
  }

  isConnected(): boolean {

    return this.hubConnection?.state === 'Connected';
  }
}