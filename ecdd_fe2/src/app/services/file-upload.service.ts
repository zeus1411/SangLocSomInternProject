import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.url;

  constructor(private http: HttpClient) { }

  uploadFile(file: File, isPublic: boolean = true): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return new Observable(observer => {
      this.http.post(
        `${this.apiUrl}/api/upload/uploading?isPublic=${isPublic}`, 
        formData,
        {
          reportProgress: true,
          observe: 'events'
        }
      ).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.Response) {
            observer.next(event.body);
            observer.complete();
          }
        },
        error: (error) => {
          observer.error(error.error || { message: 'Upload failed' });
        }
      });
    });
  }
}