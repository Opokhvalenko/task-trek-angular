import { Routes } from '@angular/router';
import { TodosPageComponent } from './pages/todos-page/todos-page.component';
import { AboutPageComponent } from './about/about-page/about-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'todos/all', pathMatch: 'full' },
  { path: 'todos', redirectTo: 'todos/all', pathMatch: 'full' },
  { path: 'todos/:status', component: TodosPageComponent },
  { path: 'about', component: AboutPageComponent },
  { path: '**', redirectTo: 'todos/all' },
];
