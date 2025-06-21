import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);

  @Input() title = 'Error';
  message = '';
  hidden = true;
  destroy$$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }

  ngOnInit(): void {
    this.messageService.message$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((text) => {
        console.log(2);
        this.hidden = false;
        this.message = text;
      });
  }
}
