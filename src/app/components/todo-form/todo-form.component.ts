import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss'],
})
export class TodoFormComponent {
  @Output() save = new EventEmitter<string>();

  title = '';

  submitTodo() {
    if (this.title.trim()) {
      this.save.emit(this.title);
      this.title = '';
    }
  }
}
