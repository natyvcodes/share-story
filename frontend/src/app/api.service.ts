import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, combineLatest } from 'rxjs';
import { catchError, of } from 'rxjs';
import { environment } from '../environments/environment';

export interface Story {
  id: number;
  name: string;
  description: string;
  content: string;
  admin_id: number;
  in_progress: boolean;
  image_url: string;
}
interface user {
  id: number;
  name: string;
  email: string;
}
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.url;

  userIsLogIn = new BehaviorSubject<boolean>(false);
  userIsLogIn$ = this.userIsLogIn.asObservable();

  userId = new BehaviorSubject<number>(0);
  userId$ = this.userId.asObservable();

  storyOwner = new BehaviorSubject<number>(0);
  storyOwner$ = this.storyOwner.asObservable();

  storyState = new BehaviorSubject<boolean>(false);
  storyState$ = this.storyState.asObservable();

  storyAdmin = new BehaviorSubject<boolean>(false);
  storyAdmin$ = this.storyAdmin.asObservable();

  stories = new BehaviorSubject<Story[]>([]);
  stories$ = this.stories.asObservable();

  constructor(private http: HttpClient) {
    this.userIsLogged()
    this.getStories()
  }
  updateStoryState(id: number, in_progress: boolean) {
    return this.http.post<{ state: boolean }>(`${this.apiUrl}/updateStoryState`, { id, in_progress }).pipe(
      tap(response => {
        this.storyState.next(response.state)
      })
    )
  }
  deleteStory(id: number) {
    return this.http.post<{ message: 'Story deleted' }>(`${this.apiUrl}/deleteStory`, { id }).pipe(
      tap(() => {
        const updatedStories = this.stories.value.filter(story => story.id !== id);
        this.stories.next(updatedStories);
      })
    );
  }
  getStories() {
    return this.http.get<Story[]>(`${this.apiUrl}/getStories`).pipe(
      tap(response => {
      
        this.stories.next(response)
      })
    );
  }
  updateStory(id: number, newContent: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/updateStory`, { id, newContent });
  }
  createStory(story: any) {
    return this.http.post<{ id: number }>(`${this.apiUrl}/addStory`, story);
  }

  getStoryById(id: number) {
    return this.http.post<Story>(`${this.apiUrl}/getStoryById`, { id }).pipe(
      tap(response => {
        this.storyOwner.next(response.admin_id)
        this.storyState.next(response.in_progress)

      }
      )
    )
  }
  getUserById(id: number) {
    return this.http.post<user>(`${this.apiUrl}/getUserById`, { id })
  }
  LogUser(email: string, password: string) {
    return this.http.post<{ message: string; token: string, name: string, id: string, email: string }>(`${this.apiUrl}/Login`, {
      email,
      password,
    }).pipe(
      tap(response => {
        this.saveToken(response.token, response.name, response.id);
        this.userId.next(parseInt(response.id));
        this.userIsLogIn.next(true);
        const user: user = {
          id: Number(response.id),
          name: response.name,
          email: response.email
        }
        localStorage.setItem('userData', JSON.stringify(user))
      })
    );
  }
  userIsLogged() {
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      this.userIsLogIn.next(true);
      this.userId.next(parseInt(userId))
    } else {
      this.userIsLogIn.next(false);
    }
  }
  logOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    this.userIsLogIn.next(false);
  }
  private saveToken(token: string, name: string, id: string) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userName', name)
    localStorage.setItem('userId', id)
  }
  userRegister(name: string, email: string, password: string) {
    return this.http.post<{ token: string, name: string, id: string, email:string }>(`${this.apiUrl}/userRegister`, { name, email, password }).pipe(
      tap(response => {
        this.saveToken(response.token, response.name, response.id)
        const user: user = {
          id: Number(response.id),
          name: response.name,
          email: response.email
        }
        localStorage.setItem('userData', JSON.stringify(user))
        this.userIsLogIn.next(true)
      })
    )
  }
  public setAdmin() {
    combineLatest([this.storyOwner$, this.userId$]).subscribe(([owner, user]) => {
      if (owner === user && owner != 0) {
        this.storyAdmin.next(true);
      } else {
        this.storyAdmin.next(false);
      }
    });
  }
  deleteAccount(id: number | undefined) {
    return this.http.post<{ message: 'Account deleted' }>(`${this.apiUrl}/deleteAccount`, { id })
  }

}
