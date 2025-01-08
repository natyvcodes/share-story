import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, combineLatest } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000';

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

  constructor(private http: HttpClient) {
    this.userIsLogged()
  }
  updateStoryState(id: number, in_progress: boolean) {
    return this.http.post<{ state: boolean }>(`${this.apiUrl}/updateStoryState`, { id, in_progress }).pipe(
      tap(response => {
        this.storyState.next(response.state)
      })
    )
  }
  deleteStory(id: number) {
    return this.http.post<{ message: 'Story deleted' }>(`${this.apiUrl}/deleteStory`, { id })
  }
  updateStory(id: number, newContent: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/updateStory`, { id, newContent });
  }
  createStory(story: FormData) {
    return this.http.post<{ id: number }>(`${this.apiUrl}/addStory`, story);
  }
  getStories() {
    return this.http.get<Story[]>(`${this.apiUrl}/getStories`);
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
    localStorage.removeItem('userId')
    this.userIsLogIn.next(false);
  }
  private saveToken(token: string, name: string, id: string) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userName', name)
    localStorage.setItem('userId', id)
  }
  userRegister(name: string, email: string, password: string) {
    return this.http.post<{ token: string, name: string, id: string }>(`${this.apiUrl}/userRegister`, { name, email, password }).pipe(
      tap(response => {
        this.saveToken(response.token, response.name, response.id)
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
