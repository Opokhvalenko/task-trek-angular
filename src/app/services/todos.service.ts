import { BehaviorSubject, tap, withLatestFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Todo } from '../types/todo';

const USER_ID = 6548;
const API_URL = 'https://mate.academy/students-api';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private http = inject(HttpClient);

  private todos$$ = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todos$$.asObservable();

  loadTodos() {
    return this.http.get<Todo[]>(`${API_URL}/todos?userId=${USER_ID}`).pipe(
      tap((todos) => {
        this.todos$$.next(todos);
      })
    );
  }

  createTodo(title: string) {
    return this.http
      .post<Todo>(`${API_URL}/todos`, {
        title,
        userId: USER_ID,
        completed: false,
      })
      .pipe(
        withLatestFrom(this.todos$$),
        tap(([createdTodo, todos]) => {
          this.todos$$.next([...todos, createdTodo]);
        })
      );
  }
  updateTodo({ id, ...data }: Todo) {
    return this.http.patch<Todo>(`${API_URL}/todos/${id}`, data).pipe(
      withLatestFrom(this.todos$$),
      tap(([updatedTodo, todos]) => {
        this.todos$$.next(
          todos.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      })
    );
  }

  deleteTodo(todo: Todo) {
    return this.http.delete<void>(`${API_URL}/todos/${todo.id}`).pipe(
      withLatestFrom(this.todos$$),
      tap(([, todos]) => {
        this.todos$$.next(todos.filter((t) => t.id !== todo.id));
      })
    );
  }
}
