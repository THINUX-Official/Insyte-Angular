import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSummaryCard } from '../../models/dashboard-ui.model';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-card.html',
  styleUrls: ['./summary-card.scss']
})
export class SummaryCard {
  @Input({ required: true }) card!: DashboardSummaryCard;
}
