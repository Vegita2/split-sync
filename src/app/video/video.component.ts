import { ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { TimeDisplayPipe } from '../pipes/time-display.pipe';
import { DiffComponent } from './diff/diff.component';
import { MatCardModule } from '@angular/material/card';
import { SplitsTimePipe } from '../pipes/splits-time.pipe';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { SplitTimePipe } from '../pipes/split-time.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CurrentSplitPipe } from '../pipes/current-split.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

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
		MatCardModule,
		SplitsTimePipe,
		CdkDropList,
		CdkDrag,
		CdkDragHandle,
		SplitTimePipe,
		MatSlideToggleModule,
		MatTooltipModule,
	],
	templateUrl: './video.component.html',
	styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit {

	@ViewChild('videoEl') video!: ElementRef<HTMLVideoElement>;

	src: any = '';

	fps = signal(60);
	currentSeconds = signal(0);
	noSyncCurrentSplit = signal(-1);
	playing = signal(false);

	private _splits: Split[] = [];

	get splits() {
		return this._splits;
	}

	@Input()
	set splits(val: Split[]) {
		this._splits = val;
		this.splitsChange.emit(this.splits);
	}

	@Input()
	otherSplits: Split[] = [];

	@Output()
	splitsChange = new EventEmitter<Split[]>();

	@Input()
	sync = false;

	@Output()
	syncChange = new EventEmitter<boolean>();

	@Input()
	events = new Subject<VideoEvent>();

	@Input()
	currentSplit = -1;

	constructor(
		private snackbar: MatSnackBar,
		private ref: ChangeDetectorRef,
	) {
	}

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

		const splitPipe = new CurrentSplitPipe();
		const updateCurrentFrame: VideoFrameRequestCallback = (_, meta) => {
			this.currentSeconds.set(video.currentTime);
			const index = splitPipe.transform(this.splits, this.currentSeconds());
			this.noSyncCurrentSplit.set(index);
			this.ref.detectChanges();
			video.requestVideoFrameCallback(updateCurrentFrame);
		};

		video.requestVideoFrameCallback(updateCurrentFrame);
	}

	async readFile(file: File) {
		const reader = new FileReader();
		const promise = new Promise<string | ArrayBuffer>((res, rej) => {
			reader.onloadend = event => {
				const arrayBuffer = event.target!.result;
				const blob = new Blob([arrayBuffer as any], { type: file.type });
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

	framesToSeconds(frames: number) {
		return frames / this.fps();
	}

	jumpTo(seconds: number) {
		this.video.nativeElement.currentTime = seconds;
	}

	addSplit() {
		const newSplit: Split = {
			timestamp: this.video?.nativeElement?.currentTime ?? 0,
		};
		this.splits = [...this.splits, newSplit];
	}

	removeSplit(index: number) {
		this.splits = [...this.splits.slice(0, index), ...this.splits.slice(index + 1)];

	}

	splitsChanged() {
		this.splits = [...this.splits];
	}

	moveSplits(event: CdkDragDrop<Split[]>) {
		moveItemInArray(this.splits, event.previousIndex, event.currentIndex);
		this.splitsChanged();
	}

	async exportSplits() {
		const out = JSON.stringify(this.splits);
		await navigator.clipboard.writeText(out);
	}

	async importSplits() {
		const text = await navigator.clipboard.readText();
		this.splits = JSON.parse(text);
	}


}
