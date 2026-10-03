import { EventEmitter, Injectable } from '@angular/core';

// TypeScript 4.3's lib.dom.d.ts predates the MediaRecorder typings; this app
// upgrades TypeScript alongside Angular, so fall back to `any` for now.
declare const MediaRecorder: any;
type MediaRecorder = any;

export enum RecorderState {
  INITIALIZING,
  INITIALIZED,
  RECORDING,
  PAUSED,
  STOPPING,
  STOPPED,
}

export enum ErrorCase {
  USER_CONSENT_FAILED,
  RECORDER_TIMEOUT,
  ALREADY_RECORDING,
}

@Injectable({ providedIn: 'root' })
export class AudioRecorderService {
  recorderError = new EventEmitter<ErrorCase>();

  private mediaRecorder: MediaRecorder;
  private chunks: Blob[] = [];
  private recorderState = RecorderState.INITIALIZED;

  startRecording(): void {
    if (this.recorderState === RecorderState.RECORDING) {
      this.recorderError.emit(ErrorCase.ALREADY_RECORDING);
      return;
    }
    this.chunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = event => this.chunks.push(event.data);
      this.mediaRecorder.start();
      this.recorderState = RecorderState.RECORDING;
    }).catch(() => {
      this.recorderError.emit(ErrorCase.USER_CONSENT_FAILED);
    });
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject();
        return;
      }
      this.recorderState = RecorderState.STOPPING;
      this.mediaRecorder.onstop = () => {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.recorderState = RecorderState.STOPPED;
        resolve(new Blob(this.chunks, { type: 'audio/webm' }));
      };
      this.mediaRecorder.stop();
    });
  }

  getRecorderState(): RecorderState {
    return this.recorderState;
  }
}
