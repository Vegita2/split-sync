import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { TimeDisplayPipe } from './time-display.pipe';
import { DiffComponent } from './diff/diff.component';
import { createInvalidObservableTypeError } from 'rxjs/internal/util/throwUnobservableError';

export interface Split {
	timestamp: number;
}

export enum VideoEvent {
	PLAYED,
	PAUSED,
	SEEKED,
}

@Component({
	selector: 'app-video',
	standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		NgIf,
		MatInputModule,
		FormsModule,
		NgForOf,
		MatDividerModule,
		TimeDisplayPipe,
		DiffComponent,
	],
	templateUrl: './video.component.html',
	styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit {

	@ViewChild('videoEl') video!: ElementRef<HTMLVideoElement>;

	src: any = '';
	text = '';

	fps = signal(60);
	currentSeconds = signal(0);
	playing = signal(false);

	@Input()
	splits: Split[] = [];

	@Input()
	otherSplits: Split[] = [];

	@Output()
	splitsChange = new EventEmitter<Split[]>();

	@Input()
	events = new Subject<VideoEvent>();

	@Input()
	currentSplit = -1;

	constructor(
		private snackbar: MatSnackBar,
		private ref: ChangeDetectorRef,
	) {}

	ngOnInit() {
		this.splitsChange.emit(this.splits);
	}

	async fileSelect(event: Event) {
		const video = this.video.nativeElement;
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) {
			return;
			// this.snackbar.open(`Dropped File is not valid`, 'ok', { duration: 20000 });
		}
		this.src = await this.readFile(file);
		video.onpause = () => {
			this.events.next(VideoEvent.PAUSED);
			return this.playing.set(false);
		};
		video.onplaying = () => {
			this.events.next(VideoEvent.PLAYED);
			return this.playing.set(true);
		};

		video.onseeked = () => {
			this.events.next(VideoEvent.SEEKED);
		};

		const updateCurrentFrame: VideoFrameRequestCallback = (_, meta) => {
			this.currentSeconds.set(video.currentTime);
			this.ref.detectChanges();
			video.requestVideoFrameCallback(updateCurrentFrame);
		};

		video.requestVideoFrameCallback(updateCurrentFrame);
		// await new Promise(res => setTimeout(res, 10));
	}

	async readFile(file: File) {
		const reader = new FileReader();
		const promise = new Promise<string | ArrayBuffer>((res, rej) => {
			reader.onloadend = event => {
				const arrayBuffer = event.target!.result;
				const fileType = 'video/mpeg';
				const blob = new Blob([arrayBuffer as any], { type: fileType });
				const src = URL.createObjectURL(blob);
				res(src);
			};
		});
		reader.readAsArrayBuffer(file);
		return await promise;
	}

	skipSeconds(seconds: number) {
		const video = this.video.nativeElement;
		video.currentTime += seconds;
	}

	skipFrames(count: number) {
		this.skipSeconds(this.framesToSeconds(count));
	}

	secondsToFrames(seconds: number = this.video.nativeElement.currentTime) {
		return Math.round(seconds * this.fps());
	}

	framesToSeconds(frames: number) {
		return frames / this.fps();
	}

	playPause() {
		if (this.playing()) {
			this.video.nativeElement.pause();
		} else {
			this.video.nativeElement.play();
		}
	}

	jumpTo(seconds: number) {
		this.video.nativeElement.currentTime = seconds;
	}

	addSplit() {
		const newSplit: Split = {
			timestamp: this.video?.nativeElement?.currentTime ?? 0,
		};
		this.splits.push(newSplit);
	}

	removeSplit(index: number) {
		this.splits.splice(index, 1);
	}

	async exportSplits() {
		const out = JSON.stringify(this.splits);
		await navigator.clipboard.writeText(out);
	}

	async importSplits() {
		const text = await navigator.clipboard.readText();
		this.splits = JSON.parse(text);
		this.splitsChange.emit(this.splits);
	}

	protected readonly createInvalidObservableTypeError = createInvalidObservableTypeError;
	protected readonly Input = Input;
}
