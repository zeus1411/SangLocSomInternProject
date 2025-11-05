import { Component, EventEmitter, Output } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() uploadComplete = new EventEmitter<any>();
  @Output() uploadError = new EventEmitter<string>();
  
  isUploading = false;
  progress = 0;
  selectedFile: File | null = null;
  isDragging = false;

  constructor(private fileUploadService: FileUploadService) {}

  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.uploadError.emit('Please select a file first');
      return;
    }

    this.isUploading = true;
    this.progress = 0;

    this.fileUploadService.uploadFile(this.selectedFile, true).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadComplete.emit(response);
        this.reset();
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadError.emit(error.message || 'Upload failed. Please try again.');
        this.reset();
      }
    });
  }

  private reset(): void {
    this.selectedFile = null;
    this.progress = 0;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}