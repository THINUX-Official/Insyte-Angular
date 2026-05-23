import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ChatbotWidget} from './shared/components/chatbot-widget/chatbot-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Insyte-Angular');
}
