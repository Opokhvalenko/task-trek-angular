import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Todo } from '../../types/todo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnChanges {
  @Input() todo!: Todo;
  @Output() todoDelete = new EventEmitter<Todo>();
  @Output() todoToggle = new EventEmitter<Todo>();

  @Output() todoRename = new EventEmitter<{ todo: Todo; title: string }>();

  @ViewChild('titleField')
  set titleField(field: ElementRef) {
    if (field) {
      field.nativeElement.focus();
    }
  }

  editing = false;
  title = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] && changes['todo'].currentValue) {
      this.title = changes['todo'].currentValue.title;
    }
  }

  edit(): void {
    this.editing = true;
    this.title = this.todo.title;
  }

  save(): void {
    if (!this.editing) {
      return;
    }

    this.editing = false;

    const trimmedTitle = this.title.trim();

    if (trimmedTitle && trimmedTitle !== this.todo.title) {
      this.todoRename.emit({ todo: this.todo, title: trimmedTitle });
    } else if (!trimmedTitle) {
      this.todoDelete.emit(this.todo);
    }
  }

  cancelEdit(): void {
    this.editing = false;
    this.title = this.todo.title;
  }

  onToggle(): void {
    this.todoToggle.emit(this.todo);
  }

  onDelete(): void {
    this.todoDelete.emit(this.todo);
  }
}
