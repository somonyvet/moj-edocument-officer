import { Component, Input } from '@angular/core';
import { STATUS_COLOR_OBJ } from 'src/app/dummy/appinfo';

@Component({
  selector: 'app-status-pill',
  templateUrl: './status-pill.component.html',
  styleUrls: ['./status-pill.component.scss']
})
export class StatusPillComponent {

  @Input() status: { key?: number; text?: string; name?: string; name_en?: string; color?: string; icon?: string } | null = null;
  @Input() label: string;
  @Input() color: string;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() flat = false;

  get pillColor(): string {
    return this.color || this.status?.color || STATUS_COLOR_OBJ[this.status?.key] || '#757575';
  }

  get pillLabel(): string {
    return this.label || this.status?.name || this.status?.text || '';
  }

}
