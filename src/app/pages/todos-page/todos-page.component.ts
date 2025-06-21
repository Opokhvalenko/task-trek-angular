import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  distinctUntilChanged,
  map,
  switchMap,
  Observable,
  forkJoin,
  of,
  combineLatest,
  Subject,
  takeUntil,
} from 'rxjs';
import { MessageService } from '@services/message.service';
import { TodosService } from '@services/todos.service';
import { Status } from '@app-types/status';
import { Todo } from '@app-types/todo';
import { CommonModule } from '@angular/common';
import { TodoComponent } from '@components/todo/todo.component';
import { TodoFormComponent } from '@components/todo-form/todo-form.component';
import { FilterComponent } from '@components/filter/filter.component';
import { MessageComponent } from '@components/message/message.component';

@Component({
  selector: 'app-todos-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TodoComponent,
    TodoFormComponent,
    FilterComponent,
    MessageComponent,
  ],
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss'],
})
export class TodosPageComponent implements OnInit, OnDestroy {
  todos$: Observable<Todo[]> = of([]);
  activeTodos$: Observable<Todo[]> = of([]);
  completedTodos$: Observable<Todo[]> = of([]);
  activeCount$: Observable<number> = of(0);
  visibleTodos$: Observable<Todo[]> = of([]);
  private destroy$$ = new Subject<void>();

  private todosService = inject(TodosService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    console.log('TodosPageComponent: ngOnInit called');

    this.todos$ = this.todosService.todos$.pipe(takeUntil(this.destroy$$));
    this.activeTodos$ = this.todos$.pipe(
      distinctUntilChanged(),
      map((todos) => {
        const active = todos.filter((todo) => !todo.completed);
        console.log(
          'TodosPageComponent: activeTodos$ updated (filtered):',
          active
        );
        return active;
      }),
      takeUntil(this.destroy$$)
    );
    this.completedTodos$ = this.todos$.pipe(
      map((todos) => {
        const completed = todos.filter((todo) => todo.completed);
        console.log(
          'TodosPageComponent: completedTodos$ updated (filtered):',
          completed
        );
        return completed;
      }),
      takeUntil(this.destroy$$)
    );
    this.activeCount$ = this.activeTodos$.pipe(
      map((todos) => {
        const count = todos.length;
        console.log('TodosPageComponent: activeCount$ updated (count):', count);
        return count;
      }),
      takeUntil(this.destroy$$)
    );

    this.visibleTodos$ = this.route.paramMap.pipe(
      map((params) => {
        const status = params.get('status') as Status;
        console.log(
          'TodosPageComponent: paramMap emitted status (for visibleTodos$):',
          status
        );
        return status;
      }),
      distinctUntilChanged(),
      switchMap((status) => {
        console.log(
          'TodosPageComponent: switchMap triggered for status (for visibleTodos$):',
          status
        );
        switch (status) {
          case 'active':
            return this.activeTodos$;
          case 'completed':
            return this.completedTodos$;
          default:
            return this.todos$;
        }
      }),
      takeUntil(this.destroy$$)
    );

    this.todosService
      .loadTodos()
      .pipe(takeUntil(this.destroy$$))
      .subscribe({
        next: () =>
          console.log('TodosPageComponent: Initial todos loaded successfully!'),
        error: (err) => {
          console.error('TodosPageComponent: Error loading todos:', err);
          this.messageService.showMessage('Unable to load todos');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
    console.log(
      'TodosPageComponent: ngOnDestroy called. Subscriptions unsubscribed.'
    );
  }

  trackById = (i: number, todo: Todo) => todo.id;

  addTodo(newTitle: string): void {
    console.log('TodosPageComponent: addTodo called with title:', newTitle);
    this.todosService
      .createTodo(newTitle)
      .pipe(takeUntil(this.destroy$$))
      .subscribe({
        next: () => console.log('TodosPageComponent: Todo added successfully!'),
        error: (err) => {
          console.error('TodosPageComponent: Error adding todo:', err);
          this.messageService.showMessage('Unable to add a todo');
        },
      });
  }

  toggleTodo(todo: Todo): void {
    console.log(
      'TodosPageComponent: toggleTodo called for todo:',
      todo.id,
      'current completed:',
      todo.completed
    );
    this.todosService
      .updateTodo({ ...todo, completed: !todo.completed })
      .pipe(takeUntil(this.destroy$$))
      .subscribe({
        next: () =>
          console.log('TodosPageComponent: Todo toggled successfully!'),
        error: (err) => {
          console.error('TodosPageComponent: Error toggling todo:', err);
          this.messageService.showMessage('Unable to toggle a todo');
        },
      });
  }

  renameTodo(todo: Todo, title: string): void {
    console.log(
      'TodosPageComponent: renameTodo called for todo:',
      todo.id,
      'new title:',
      title
    );
    if (todo.title === title.trim()) {
      console.log('TodosPageComponent: Title is unchanged, skipping rename.');
      return;
    }
    this.todosService
      .updateTodo({ ...todo, title: title.trim() })
      .pipe(takeUntil(this.destroy$$))
      .subscribe({
        next: () =>
          console.log('TodosPageComponent: Todo renamed successfully!'),
        error: (err) => {
          console.error('TodosPageComponent: Error renaming todo:', err);
          this.messageService.showMessage('Unable to rename a todo');
        },
      });
  }

  deleteTodo(todo: Todo): void {
    console.log('TodosPageComponent: deleteTodo called for todo:', todo.id);
    this.todosService
      .deleteTodo(todo)
      .pipe(takeUntil(this.destroy$$))
      .subscribe({
        next: () =>
          console.log('TodosPageComponent: Todo deleted successfully!'),
        error: (err) => {
          console.error('TodosPageComponent: Error deleting todo:', err);
          this.messageService.showMessage('Unable to delete a todo');
        },
      });
  }

  clearCompletedTodos(): void {
    console.log('TodosPageComponent: clearCompletedTodos called');
    this.completedTodos$
      .pipe(takeUntil(this.destroy$$))
      .subscribe((completed) => {
        console.log(
          'TodosPageComponent: Found completed todos to clear:',
          completed.length
        );
        if (completed && completed.length > 0) {
          const deleteRequests = completed.map((todo) =>
            this.todosService.deleteTodo(todo)
          );
          forkJoin(deleteRequests)
            .pipe(takeUntil(this.destroy$$))
            .subscribe({
              next: () => {
                console.log('TodosPageComponent: All completed todos cleared!');
              },
              error: (err) => {
                console.error(
                  'TodosPageComponent: Error clearing completed todos:',
                  err
                );
                this.messageService.showMessage(
                  'Unable to clear completed todos'
                );
              },
            });
        } else {
          console.log('TodosPageComponent: No completed todos to clear.');
        }
      })
      .unsubscribe();
  }

  toggleAllCompleted(): void {
    console.log('TodosPageComponent: toggleAllCompleted called');

    combineLatest([this.todos$, this.activeTodos$])
      .pipe(takeUntil(this.destroy$$))
      .subscribe(([allTodos, activeTodos]) => {
        const allCompleted = activeTodos.length === 0 && allTodos.length > 0;
        const todosToUpdate = allTodos.map((todo) => ({
          ...todo,
          completed: !allCompleted,
        }));

        if (todosToUpdate.length > 0) {
          const updateRequests = todosToUpdate.map((todo) =>
            this.todosService.updateTodo(todo)
          );
          forkJoin(updateRequests)
            .pipe(takeUntil(this.destroy$$))
            .subscribe({
              next: () =>
                console.log(
                  'TodosPageComponent: All todos toggled successfully!'
                ),
              error: (err) => {
                console.error(
                  'TodosPageComponent: Error toggling all todos:',
                  err
                );
                this.messageService.showMessage('Unable to toggle all todos');
              },
            });
        } else {
          console.log('TodosPageComponent: No todos to toggle.');
        }
      })
      .unsubscribe();
  }
}
