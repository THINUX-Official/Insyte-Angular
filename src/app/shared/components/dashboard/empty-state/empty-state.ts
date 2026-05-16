import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrls: ['./empty-state.scss']
})
export class EmptyState {
  @Input() icon = '📭';
  @Input() title = 'No data found';
  @Input() message = 'There are no records available to display.';
  @Input() actionLabel = '';
  @Input() showAction = false;
}
